from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class QueryRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    id: UUID
    final_answer: str

    model_config = {
        "from_attributes": True
    }

class HistoryResponse(BaseModel):
    question: str
    search_query: str
    attempts: int
    final_answer: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class HistoryListResponse(BaseModel):
    history: List[HistoryResponse]
    page: int
    size: int

    model_config = {
        "from_attributes": True
    }
