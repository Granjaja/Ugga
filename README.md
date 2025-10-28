Technology Stack


Backend

FastAPI - Python framework for building REST API used in queries and RAG pipeline orchestration

Pinecone - vector database for document embedding - store, index, and retrieve vectors 

OpenAI - a large language model for answer generation 

PostgreSQL - to audit logging in and control access 

Uvicorn - ASGI server to run FastAPI 

Apache Tika - for document parsing 

AWS - cloud providers with full US coverage and mature managed services - where Pinecone hosts the vector index 

Frontend

Next.js - Web and mobile-friendly interface 

Tailwind CSS - UI styling 

Typescript - type safety 

Fetch API - communicates with FastAPI backend


CICD Pipeline 

Github actions

Deployment 
Render 

RAG Architecture Diagram 
RAG_diagram.drawio.pdf

How to Run 
```bash 

cd .../backend 
uvicorn api:app --reload

cd ../frontend 
npm run dev 


cd ../frontend 
npm run dev 
