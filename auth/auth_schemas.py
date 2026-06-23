from pydantic import BaseModel, EmailStr, Field
from typing import List
from uuid import UUID

class Login(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length= 8,
        max_length= 128,
        description="Password must be at least 8 characters"
    )

class Signup(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"
    password: str = Field(
        min_length= 8,
        max_length= 128,
        description="Password must be at least 8 characters"
    )

class User(BaseModel):
    id: UUID
    email: str
    name: str
    role: str

class UserList(BaseModel):

    users: List[User]