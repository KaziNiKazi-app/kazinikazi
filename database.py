from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = "sqlite:///./kazinikazi.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autcommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get a DB connection session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()