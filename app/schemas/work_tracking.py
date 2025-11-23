from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WorkSessionCreate(BaseModel):
    job_id: str
    daily_payment: int = Field(..., gt=0, description="Daily payment in RWF")

class WorkSessionStart(BaseModel):
    notes: Optional[str] = None

class WorkSessionEnd(BaseModel):
    notes: Optional[str] = None

class WorkSessionApproveStart(BaseModel):
    approved: bool = True
    employer_notes: Optional[str] = None

class WorkSessionApproveEnd(BaseModel):
    approved: bool = True
    employer_notes: Optional[str] = None

class WorkSessionResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    employer_id: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    daily_payment: int
    hours_worked: Optional[float]
    start_approved: bool
    end_approved: bool
    work_started: bool
    work_ended: bool
    notes: Optional[str]
    employer_start_notes: Optional[str]
    employer_end_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_name: str
    job_title: str
    employer_name: str

    class Config:
        from_attributes = True

class WorkSessionSummary(BaseModel):
    total_sessions: int
    approved_sessions: int
    total_earnings: int
    pending_start_approval: int
    pending_end_approval: int
    total_hours: float