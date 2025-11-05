import uuid
import datetime
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, Text, UUID


# --- User Model ---
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, index=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    date_of_birth = Column(Date)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone_number = Column(String(20))
    hashed_password = Column(String(1000), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationship to JobApplication
    applications = relationship("JobApplication", back_populates="applicant")

# --- Employer Model ---
class Employer(Base):
    __tablename__ = "employers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone_number = Column(String(20))
    hashed_password = Column(String(1000), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationship to Jobs they posted
    jobs = relationship("Job", back_populates="owner")

# --- Category Model ---
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationship to Jobs in this category
    jobs = relationship("Job", back_populates="category")

# --- Job Model ---
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(200))
    pay = Column(Float)
    expiry_date = Column(Date, nullable=False)

    # Foreign Key for the Employer who posted the job
    owner_id = Column(Integer, ForeignKey("employers.id"))
    # Foreign Key for the Category
    category_id = Column(Integer, ForeignKey("categories.id"))

    # Relationship to Employer
    owner = relationship("Employer", back_populates="jobs")
    # Relationship to Category
    category = relationship("Category", back_populates="jobs")
    # Relationship to JobApplication
    applicants = relationship("JobApplication", back_populates="job")

# --- JobApplication Model ---
# This table links Users and Jobs
class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(50), default="pending")
    applied_on = Column(Date, default=datetime.date.today)

    # Relationships
    job = relationship("Job", back_populates="applicants")
    applicant = relationship("User", back_populates="applications")