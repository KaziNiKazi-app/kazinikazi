from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from app.core.security import decode_token
from app.models.user import User
from app.models.employer import Employer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# HTTP Bearer token security scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("user_type") != "user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    
    user = db.query(User).filter(User.id == payload.get("sub")).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user

def get_current_employer(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> Employer:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("user_type") != "employer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    
    employer = db.query(Employer).filter(Employer.id == payload.get("sub")).first()

    if not employer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employer not found")
    
    return employer