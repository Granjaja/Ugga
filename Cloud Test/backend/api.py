import os
from openai import OpenAI
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
import shutil


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
INDEX_NAME = os.getenv("PINECONE_INDEX")
DOC_ROOT = os.getenv("DOC_ROOT", "./documents")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize Pinecone
pc = Pinecone(
        api_key=PINECONE_API_KEY
    )
index = pc.Index(INDEX_NAME)


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



def authorize_user(authorization: str = Header(None)):
    print("AUTH HEADER:", {authorization})
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        if not token:
            raise HTTPException(status_code=401, detail="Token missing")
            
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        return {"user_id": user_id}
            
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except JWTError as e:
        print("JWT Error:", str(e))
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


@api_router.post("/query")
async def query_endpoint(req: QueryRequest, user: dict = Depends(authorize_user)):

    #1. Embed the query

    query_text = req.query

    #2. Generate embedding for the query using OpenAI
    embedding_response = client.embeddings.create(model = "text-embedding-3-small", input=query_text)

    #3. Extract the embedding vector(numerical rep of the text) from the response
    query_embed = embedding_response.data[0].embedding

    #4. Limit vectors eligible for retrive - only vectors with acl field 
    filter = {"acl":{"$exists": True}} 

    #5. Perform similarity search in Pinecone 
    res = index.query(vector=query_embed, top_k=req.top_k, include_metadata=True, 
    filter=filter, include_values=False) #query pinecone index

    #6. Extract relevant contexts from the search results

    """ context is a list of retrieved document chunks / relevant pieces of information to answer the query """

    contexts = []


    for match in res['matches']:
        contexts.append({
            "score": match['score'],
            "metadata": match['metadata']
        })

    #7. Build the prompt with the retrieved contexts and call LLM
    prompt = build_prompt(req.query, contexts)

    #8. Call OpenAI ChatCompletion API with the constructed prompt
    completion = client.chat.completions.create(
        model = "gpt-4o-mini",
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens = 512,
        temperature = 0.0
    )

    answer = completion.choices[0].message.content

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

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    try:
        file_path = os.path.join(DOC_ROOT, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}
    
@api_router.get("/list-files")
async def list_files():
    try:
        files = os.listdir(DOC_ROOT)
        return [{"name": f, "url": f"/files/{f}"} for f in files]
    except Exception as e:
        return {"error": str(e)}