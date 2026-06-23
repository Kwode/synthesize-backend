from db.database_config import Base
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4

class ResearchHistory(Base):
    __tablename__ = "research_history"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    question = Column(String, nullable=False)
    search_query = Column(String, nullable=False)
    attempts = Column(Integer, nullable=False)
    final_answer = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow())

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key= True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow())