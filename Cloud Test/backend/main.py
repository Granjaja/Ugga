from database import engine, Base, SessionLocal
from schemas import UserResponse, UserCreate, LoginRequest
from fastapi import FastAPI, Depends, Form, Header, Response, HTTPException, Cookie, Request
from sqlalchemy.orm import Session
from models import User
from auth import hash_password, verify_password, create_access_token, decode_access_token
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials, HTTPBearer
from typing import Set
from api import api_router
from fastapi.responses import JSONResponse
from jose import JWTError
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
app.include_router(api_router, prefix="/api")



#Cross-Origin Resource Sharing(CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ugga.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Set-Cookie"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
security = HTTPBearer()

token_blacklist: Set[str] = set()




#Create all the tables in the database
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Ugga"}

# Register a new user
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_email = os.getenv("ADMIN_EMAIL")

    if user.email == admin_email:
        user.role = "Admin"
    else:
        user.role = "employee"
    
    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login a user
@app.post("/login")
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login a user and return an access token.
    """
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email})
    
    # response = JSONResponse(
    #     content={"access_token": token, "token_type": "bearer"}
    # )
    
    # response.set_cookie(
    #     key="access_token",
    #     value=token,
    #     httponly=True,
    #     secure=False,  # Set to True in production
    #     samesite="none", 
    #     path="/",
    #     max_age=3600
    # )

    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }


@app.get("/get_current_user")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token") or request.headers.get("Authorization")
    
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
        

    if token.startswith("Bearer "):
        token = token.split(" ")[1]
    else:
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }
     
@app.get("/admin/dashboard")
def admin_dashboard(current_user: User = Depends(get_current_user)):
    """
    Access the admin dashboard. Only accessible by admin users.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    
    return {"message": "Welcome to the admin dashboard!"}
        

@app.post("/logout")
def logout(response: Response):
    """
    Invalidate a user's JWT token.
    """
    response = JSONResponse(
        content={"message": "Successfully logged out"}
    )
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )

    return {"message": "Successfully logged out"}







