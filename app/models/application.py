import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, DateTime, ForeignKey

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False, index=True)

    status = Column(String(50), default="pending", index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")