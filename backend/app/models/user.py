import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, DateTime


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    date_of_birth = Column(DateTime, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    district = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    applications = relationship("Application", back_populates="user")