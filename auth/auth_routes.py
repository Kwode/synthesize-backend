from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status, Depends, APIRouter
from auth.auth_schemas import Login, Signup
from db.database_config import supabase
from sqlalchemy.orm import Session
from db.db_deps import get_db
from db.models import User
from uuid import UUID

load_dotenv()

router = APIRouter() 


@router.post("/auth/register")
def sign_up(user: Signup, db: Session = Depends(get_db)):

    try:
        response = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password
            }
        )

        new_user = User(
            id = UUID(response.user.id),
            name = user.name,
            email = user.email,
            role = user.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return { "status": "success", "message": "User registered successfully" }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/auth/login")
def sign_in(user: Login):

    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": user.email,
                "password": user.password
            }
        )

        return {
            "access_token": response.session.access_token
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    
