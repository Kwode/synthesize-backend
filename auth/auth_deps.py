from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from db.database_config import supabase
from db.db_deps import get_db
from sqlalchemy.orm import Session
from db.models import User

security = HTTPBearer()

def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return credentials.credentials


def get_current_user(token: str = Depends(get_token), db: Session = Depends(get_db)):
    try:
        auth_user = supabase.auth.get_user(token).user

        user = db.query(User).filter(User.id == auth_user.id).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )
        
        return user

    except Exception:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def require_role(role: str):

    def role_checker(user = Depends(get_current_user)):

        if user.role != role:
            raise HTTPException(
                status_code= status.HTTP_403_FORBIDDEN,
                detail="Forbidden"
            )
        
        return user
        
    return role_checker