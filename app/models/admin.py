import uuid
from app.database import Base
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime


class Admin(Base):
    __tablename__ = "admins"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))