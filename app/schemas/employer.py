from pydantic import BaseModel, EmailStr
from datetime import datetime


class EmployerBase(BaseModel):
    company_name: str
    phone_number: str
    email: EmailStr
    district: str


class EmployerUpdate(BaseModel):
    first_name: str = None
    last_name: str = None
    company_name: str = None
    email: EmailStr = None
    district: str = None


class EmployerResponse(EmployerBase):
    id: str
    first_name: str = None
    last_name: str = None
    created_at: datetime
    
    class Config:
        from_attributes = True