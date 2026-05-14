import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from flask_cors import CORS

class Base(DeclarativeBase):
    pass

# Initialize engine and sessionmaker (logic from db.py)
engine = create_engine(
    url=os.getenv("DATABASE_URL"),
    pool_pre_ping=True,
    connect_args={
        "ssl": {
            "ssl": True
        }
    }
)

SessionLocal = sessionmaker(bind=engine)
cors = CORS()

def get_db_session():
    """Helper to get a new database session."""
    return SessionLocal()
