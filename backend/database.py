"""
Database setup. Uses SQLite (a single file, zero setup) -- perfectly fine for a
portfolio project. If this were a real production app you'd swap SQLite for
Postgres, but the code barely changes since SQLAlchemy abstracts that.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./diamind.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: gives each request its own DB session, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
