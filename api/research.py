from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.db_deps import get_db
from db.models import ResearchHistory
from services.graph import graph
from auth.auth_deps import get_current_user
from uuid import UUID
from math import ceil

from schemas.research_schema import QueryRequest, ResearchResponse, HistoryResponse, HistoryListResponse

router = APIRouter()

@router.post("/research", response_model= ResearchResponse)
def research(query: QueryRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    
    result = graph.invoke({
        "question": query.query,
        "attempts": 0,
    })

    new_state = ResearchHistory(
        user_id = current_user.id,
        question = result['question'],
        search_query = result['search_query'],
        final_answer = result['final_answer'],
        attempts = result['attempts']
    )

    db.add(new_state)

    db.commit()

    db.refresh(new_state)
    
    return {
        "id": new_state.id,
        "final_answer": new_state.final_answer
    }

@router.get('/history', response_model= HistoryListResponse)
def get_history(db: Session = Depends(get_db), current_user = Depends(get_current_user), page: int = 1, size: int = 10):

    offset = (page - 1) * size

    total = (
        db.query(func.count(ResearchHistory.id))
        .filter(ResearchHistory.user_id == current_user.id)
        .scalar()
    )

    history = (
                db.query(ResearchHistory)
               .filter(ResearchHistory.user_id == current_user.id)
               .order_by(ResearchHistory.created_at.desc())
               .offset(offset).limit(size).all()
            )

    return {
        "history": history,
        "page": page,
        "size": size,
    }

@router.get('/history/{history_id}', response_model= HistoryResponse)
def get_history_by_id(history_id: UUID, current_user = Depends(get_current_user), db: Session = Depends(get_db)):

    history_by_id = db.query(ResearchHistory).filter(ResearchHistory.id == history_id, ResearchHistory.user_id == current_user.id).first()

    if not history_by_id:
        raise  HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= "Research history does not exist")
    
    return history_by_id

@router.delete('/history/{history_id}')
def delete_history(history_id: UUID, current_user = Depends(get_current_user), db: Session = Depends(get_db)):

    history = db.query(ResearchHistory).filter(ResearchHistory.id == history_id, ResearchHistory.user_id == current_user.id).first()

    if not history:
        raise  HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= "Research history does not exist")
    
    db.delete(history)
    db.commit()

    return {
        "message": "Research history deleted successfully"
    }
