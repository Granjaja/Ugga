from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    name: str
    role: str = "employee" 

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True  #accepts input data from SQLAlchemy model instance not just a dictionary

class LoginRequest(BaseModel):
    email: str
    password: str
        
