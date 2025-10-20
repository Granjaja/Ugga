import os
import openai
from pinecone import Pinecone
import time
from fastapi import FastAPI, HTTPException, Header, Depends, Request, APIRouter, UploadFile, File
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from database import SessionLocal
from sqlalchemy.orm import Session
from jose import JWTError
from models import User
from auth import decode_access_token



load_dotenv()



OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
INDEX_NAME = os.getenv("PINECONE_INDEX")
DOC_ROOT = os.getenv("DOC_ROOT", "./documents")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


openai.api_key = OPENAI_API_KEY

pc = Pinecone(
        api_key=PINECONE_API_KEY
    )
index = pc.Index(INDEX_NAME)

app = FastAPI()

api_router = APIRouter()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#  Request model for query endpoint
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5  # Number of top results to return


#  User authorization 
@api_router.get("/user_authorization")
def authorize_user(auth_header: str = Header(None)):
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    try:
        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user = {"user_id": user_id}  # In real implementation, fetch user from DB
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user

#Function to build the prompt 
def build_prompt(query: str, contexts: list[dict]) -> str:
    prompt = "You are a knowledgeable assistant. Use only the provided context to answer the question and cite sources by doc_id and chunk_index.\n\n"
    prompt += "Context:\n"

    """loop through all the retrieved document chunks (stored in contexts)"""

    for context in contexts:
        prompt += f"[{context['doc_id']} - chunk {context['chunk_index']}]: {context['text']}\n"
        prompt += f"---\nDOC: {context['metadata']['doc_id']} (chunk {context['metadata']['chunk_index']})\n{context['metadata']['text_preview']}\n\n"
    prompt += f"\nQuestion: {query}\nAnswer concisely and include citations like [doc_id::chunk_index]."
    return prompt


@app.post("/query")
async def query_endpoint(req: QueryRequest, authorization: str = Header(None)):
    user = authorize_user(authorization)

    #1. Embed the query

    embed_response = openai.Embedding.create(model = "text-embedding-3-small", input=req.query)

    query_embed = embed_response['data'][0]['embedding']

    #2. Query Pinecone for similar document chunks

    # filter = {"acl.team": {"$in": user['teams']}}

    filter = {"acl":{"$exists": True}} # vectors with acl field for testing

    res = index.query(vector=query_embed, top_k=req.top_k, include_metadata=True, filter=filter, include_values=False) #query pinecone index

    contexts = []

    for match in res['matches']:
        contexts.append({
            "score": match['score'],
            "metadata": match['metadata']
        })

    #3. Build the prompt with the retrieved contexts and call LLM
    prompt = build_prompt(req.query, contexts)

    completion = openai.ChatCompletion.create(
        model = "gpt-4o-mini",
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens = 512,
        temperature = 0.0
    )

    answer = completion['choices'][0]['message']['content']

    #4. Audit log entry for the query and response 

    audit = {
        "timestamp": int(time.time()),
        "user": user['user_id'],
        "query": req.query,
        "returned_docs": [c['metadata']['doc_id'] for c in contexts],
    }

    print("AUDIT LOG:", audit)


    #5. Return the answer and sources
    sources = [{"doc_id": c['metadata']['doc_id'], "chunk_index": c['metadata']['chunk_index'], "text_preview": c['metadata']['text_preview'], "source_path": c['metadata']['source']} for c in contexts]

    return {"answer": answer, "sources": sources, "audit_log": audit}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        with open(os.path.join(DOC_ROOT, file.filename), "wb") as f:
            f.write(contents)
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}