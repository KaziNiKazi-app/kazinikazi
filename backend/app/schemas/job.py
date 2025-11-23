from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class JobBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    category: str
    district: str
    salary: int = Field(..., gt=0)

class JobCreate(JobBase):
    application_deadline: Optional[datetime] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    district: Optional[str] = None
    salary: Optional[int] = None
    status: Optional[str] = None
    application_deadline: Optional[datetime] = None

class JobResponse(JobBase):
    id: str
    slug: str
    status: str
    employer_id: str
    application_deadline: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class JobDetailResponse(JobResponse):
    employer_name: str 