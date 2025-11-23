from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminStats(BaseModel):
    total_users: int
    total_employers: int
    total_jobs: int
    active_jobs: int
    total_applications: int
    pending_applications: int

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    district: str
    date_of_birth: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class EmployerResponse(BaseModel):
    id: str
    first_name: Optional[str]
    last_name: Optional[str]
    company_name: str
    email: str
    phone_number: str
    district: str
    created_at: datetime

    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    district: str
    salary: int
    status: str
    employer_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True