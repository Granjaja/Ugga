from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = "users" #table name in the database

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="employee") 

