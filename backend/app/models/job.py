import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(300), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    salary = Column(Integer, nullable=False)
    status = Column(String(50), default="active", index=True)
    application_deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), index=True)

    employer_id = Column(String(50), ForeignKey("employers.id"), nullable=False, index=True)

    employer = relationship("Employer", back_populates="jobs")
    applications = relationship("Application", back_populates="job")

