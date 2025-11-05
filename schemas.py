from uuid import UUID
from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr

# --- Base schemas ---

class JobApplicationBase(BaseModel):
    status: Optional[str] = "pending"

class JobBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    pay: Optional[float] = None
    expiry_date: date
    category_id: int

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = None

class EmployerBase(BaseModel):
    username: str
    email: EmailStr
    phone_number: Optional[str] = None

# --- Schemas for creating data ---
# These include passwords

class UserCreate(UserBase):
    password: str

class EmployerCreate(EmployerBase):
    password: str

class CategoryCreate(CategoryBase):
    pass

class JobCreate(JobBase):
    pass

class JobApplicationCreate(JobApplicationBase):
    job_id: int

# --- Schemas for reading data ---
# These will be read from the db, so they have idds
# These do NOT include passwords

class Category(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class User(UserBase):
    id: UUID
    is_active: bool
    class Config:
        orm_mode = True

class Employer(EmployerBase):
    id: UUID
    is_active: bool
    class Config:
        orm_mode = True

class UserForApplication(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    class Config:
        orm_mode = True

class JobForApplication(BaseModel):
    id: int
    title: str
    location: Optional[str] = None
    class Config:
        orm_mode = True


class JobApplication(JobApplicationBase):
    id: int
    user_id: UUID
    job_id: int
    applied_on: date
    applicant: UserForApplication
    job: JobForApplication
    class Config:
        orm_mode = True

class Job(JobBase):
    id: int
    owner_id: UUID
    category: Category
    owner: Employer
    class Config:
        orm_mode = True


# --- Schemas for auth ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    sub_type: Optional[str] = None # 'user' or 'employer'