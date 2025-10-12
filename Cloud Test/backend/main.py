from database import engine, Base, SessionLocal
from schemas import UserResponse, UserCreate
from fastapi import FastAPI, Depends, Form, Header
from sqlalchemy.orm import Session
from models import User
from fastapi import HTTPException
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI()
#Create all the tables in the database
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register a new user
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        password=hashed_password,
        name=user.name,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login a user
@app.post("/login")
def login(email: str=Form(...), password: str=Form(...), db: Session = Depends(get_db)):
    """
    Login a user and return an access token.
    """
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email}) #"sub" is the subject of the token - usually the user's email
    return {"access_token": token, "token_type": "bearer"}

# User authorization function
def authorize_user(token: str = Header(None), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = token.split(" ")[1]
    payload = decode_access_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# Protected route for auth
@app.post("/protected")
def protected_route(user: User = Depends(authorize_user)):
    return {"message": "Welcome to the protected route!", "user": user}

