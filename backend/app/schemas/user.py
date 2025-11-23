from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: EmailStr
    district: str


class UserUpdate(BaseModel):
    first_name: str = None
    last_name: str = None
    email: EmailStr = None
    district: str = None


class UserResponse(UserBase):
    id: str
    date_of_birth: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True