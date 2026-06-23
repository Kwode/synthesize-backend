from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth.auth_deps import get_current_user
from auth.auth_deps import require_role
from auth.auth_schemas import UserList
from db.db_deps import get_db
from db.models import User

router = APIRouter()

@router.get('/me')
def get_current_user(current_user = Depends(get_current_user)):
    return{
        "user": current_user.id,
        "email": current_user.email
    }

@router.get('/dashboard')
def profile(current_user = Depends(require_role('user'))):

    return {
        "current_user": current_user,
        "message": "welcome admin"
    }

@router.get('/users', response_model= UserList)
def get_users(db: Session = Depends(get_db), current_user = Depends(require_role("user")), page: int = 1, size: int = 10):

    offset = (page - 1) * size

    users = db.query(User).order_by(User.created_at.desc()).offset(offset).limit(size).all()

    return {"users": users}