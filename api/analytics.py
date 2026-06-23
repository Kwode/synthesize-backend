from fastapi import APIRouter, Depends
from schemas.analytics_schema import AnalyticsResponse
from db.db_deps import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models import User, ResearchHistory
from auth.auth_deps import get_current_user

router = APIRouter()

@router.get('/analytics', response_model= AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):

    total_users = db.query(User).count()
    total_researches = db.query(ResearchHistory).count()
    total_attempts = db.query(func.coalesce(func.sum(ResearchHistory.attempts), 0)).scalar()
    latest_research = db.query(func.max(ResearchHistory.created_at)).scalar()

    average_attempts = total_attempts/total_researches if total_researches > 0 else 0

    return{
        "total_users": total_users,
        "total_researches": total_researches,
        "average_attempts": average_attempts,
        "latest_research": latest_research
    }