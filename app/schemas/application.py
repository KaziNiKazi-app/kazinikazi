from datetime import datetime
from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    job_id: str

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    user_first_name: str
    user_last_name: str
    user_phone: str
    user_email: str
    job_title: str
    job_company: str

    