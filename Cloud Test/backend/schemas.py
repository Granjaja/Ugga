from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "employee" 

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True  #accepts input data from SQLAlchemy model instance not just a dictionary