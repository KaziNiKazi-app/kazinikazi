from datetime import datetime
from app.core.security import validate_password_strength
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    date_of_birth: datetime
    district: str = Field(..., min_length=2)

    @field_validator('password')
    def validate_password(cls, v):
        is_valid, message = validate_password_strength(v)
        if not is_valid:
            raise ValueError(message)
        return v
    
class EmployerRegister(BaseModel):
    first_name: str = Field(None, min_length=2, max_length=100)
    last_name: str = Field(None, min_length=2, max_length=100)
    company_name: str = Field(None, min_length=2, max_length=255)
    phone_number: str = Field(..., min_length=10, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    district: str = Field(..., min_length=2)

    @field_validator('password')
    def validate_password(cls, v):
        is_valid, message = validate_password_strength(v)
        if not is_valid:
            raise ValueError(message)
        return v

class Login(BaseModel):
    email: EmailStr
    password: str
    user_type: str = Field(..., pattern=r'^(user|employer)$')

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    user_type: str

class RefreshToken(BaseModel):
    refresh_token: str
    