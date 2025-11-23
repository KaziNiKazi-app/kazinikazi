import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float

class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False, index=True)
    employer_id = Column(String(50), ForeignKey("employers.id"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    daily_payment = Column(Integer, nullable=False)
    hours_worked = Column(Float, nullable=True)
    start_approved = Column(Boolean, default=False, index=True)
    end_approved = Column(Boolean, default=False, index=True)
    work_started = Column(Boolean, default=False, index=True)
    work_ended = Column(Boolean, default=False, index=True)
    notes = Column(Text, nullable=True)
    employer_start_notes = Column(Text, nullable=True)
    employer_end_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    user = relationship("User", backref="work_sessions")
    job = relationship("Job", backref="work_sessions")
    employer = relationship("Employer", backref="work_sessions")