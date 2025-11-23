import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, DateTime


class Employer(Base):
    __tablename__ = "employers"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    company_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    district = Column(String(30), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    jobs = relationship("Job", back_populates="employer")