import pinecone
import os
from dotenv import load_dotenv
from tika import parser
import openai
import glob


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
INDEX_NAME = os.getenv("PINECONE_INDEX", "gran_vibe-coding")
DOC_ROOT = os.getenv("DOC_ROOT", "./documents")

openai.api_key = OPENAI_API_KEY

# Initialize Pinecone 
pinecone.init(api_key=PINECONE_API_KEY, environment = PINECONE_ENVIRONMENT)

# Create Pinecone index if it doesn't exist
if INDEX_NAME not in pinecone.list_indexes():
    pinecone.create_index(INDEX_NAME, dimension=1536, metric='cosine', pod_type='p1')

index = pinecone.Index(INDEX_NAME)


# Function to extract text from file using Apache Tika
def extract_text(path: str) -> str:
    """Extract text from a file."""
    parsed = parser.from_file(path)
    text = parsed.get("content", "")
    return text.strip() 

# Chunk text into smaller pieces
def chunk_text(text:str, chunk_size:1000, overlap:200):
    """Chunk text into smaller pieces."""
    tokens = text.split()
    i = 0
    while i < len(tokens):
        chunks = tokens[i:i + chunk_size]
        yield " ".join(chunks)
        i+= chunk_size - overlap

#Function to embed text using OpenAI
def embed_text(text: list[str]) -> list[list[float]]:
    """Embed text using OpenAI."""
    resp =openai.Embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return [item.embedding for item in resp.data]
    
def upsert_to_pinecone(path:str, acl: dict):
    """Upsert vectors to Pinecone."""
    text = extract_text(path)
    if not text:
        print(f"No text found in {path}"); return
    
    doc_id = os.path.splitext(os.path.basename(path))[0]
    chunks = list(chunk_text(text))
    embeddings = embed_text(chunks)

    items = []

    for i, embedding in enumerate(embeddings):  # Iterate over embeddings list returning key, value pairs
       """ 
       i is the index(chunk number)
       embedding is the vector for the chunk
       Access Control List (ACL) is a dictionary specifying read and write permissions for the vector."""
       vector_id = f"{doc_id}_chunk_{i}"

       metadata = {
           "source": path,
           "doc_id": doc_id,
           "chunk_index": i,
           "acl": acl,  
           "text_preview": chunks[i][:100]
         }
       
    items.append((vector_id, embedding, metadata))  # Append tuple of vector_id, embedding, metadata to items list

    # Upsert in batches to Pinecone
    batch_size = 100
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        index.upsert(vectors=batch)
        print(f"Upserted batch {i//batch_size + 1} with {len(batch)} vectors.")


def discover_and_ingest(directory: str, acl: dict):
    """
    Discover files in a directory and ingest them.
    
    Treat all files under DOC_ROOT as internal (same permission) ACLs rather than source ACLs
    """
    for path in glob.glob(f"{DOC_ROOT}/**/*.*", recursive=True): # Recursively find all files in DOC_ROOT folder
        if path.lower().endswith(('.pdf', '.docx', '.txt')):
           acl ={"access": "company", "teams":["all"]} 

           try:
                upsert_to_pinecone(path, acl)
           except Exception as e:
                print(f"Error ingesting {path}: {e}")


if __name__ == "__main__":
    discover_and_ingest()
