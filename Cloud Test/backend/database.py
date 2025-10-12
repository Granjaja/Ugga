from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os


DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL) #factory function from SQLAlchemy that sets up a connection configuration.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # create sessions that interact with the database
Base = declarative_base() #base class for ORM models to inherit from