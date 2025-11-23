from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserRegister, EmployerRegister, Login, TokenResponse, RefreshToken
from app.models.user import User
from app.models.employer import Employer
from app.models.admin import Admin
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/user", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    if (db.query(User).filter(User.email == user_data.email.lower()).first() or 
        db.query(Employer).filter(Employer.email == user_data.email.lower()).first()):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if (db.query(User).filter(User.phone_number == user_data.phone_number).first() or 
        db.query(Employer).filter(Employer.phone_number == user_data.phone_number).first()):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        email=user_data.email.lower(),
        hashed_password=get_password_hash(user_data.password),
        date_of_birth=user_data.date_of_birth,
        district=user_data.district
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token_data = {"sub": new_user.id, "user_type": "user"}
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user_id=new_user.id,
        user_type="user"
    )

@router.post("/register/employer", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_employer(employer_data: EmployerRegister, db: Session = Depends(get_db)):
    if (db.query(User).filter(User.email == employer_data.email.lower()).first() or 
        db.query(Employer).filter(Employer.email == employer_data.email.lower()).first()):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if (db.query(User).filter(User.phone_number == employer_data.phone_number).first() or 
        db.query(Employer).filter(Employer.phone_number == employer_data.phone_number).first()):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_employer = Employer(
        first_name=employer_data.first_name,
        last_name=employer_data.last_name,
        company_name=employer_data.company_name,
        phone_number=employer_data.phone_number,
        email=employer_data.email.lower(),
        hashed_password=get_password_hash(employer_data.password),
        district=employer_data.district
    )
    
    db.add(new_employer)
    db.commit()
    db.refresh(new_employer)
    
    token_data = {"sub": new_employer.id, "user_type": "employer"}
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user_id=new_employer.id,
        user_type="employer"
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: Login, db: Session = Depends(get_db)):
    email = login_data.email.lower()
    
    user = db.query(User).filter(User.email == email).first()
    if user and verify_password(login_data.password, user.hashed_password):
        token_data = {"sub": user.id, "user_type": "user"}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            user_id=user.id,
            user_type="user"
        )
    
    employer = db.query(Employer).filter(Employer.email == email).first()
    if employer and verify_password(login_data.password, employer.hashed_password):
        token_data = {"sub": employer.id, "user_type": "employer"}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            user_id=employer.id,
            user_type="employer"
        )
    
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin and verify_password(login_data.password, admin.hashed_password):
        token_data = {"sub": admin.id, "user_type": "admin"}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
            user_id=admin.id,
            user_type="admin"
        )
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(refresh_data: RefreshToken):
    payload = decode_token(refresh_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    user_type = payload.get("user_type")
    
    token_data = {"sub": user_id, "user_type": user_type}
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user_id=user_id,
        user_type=user_type
    )