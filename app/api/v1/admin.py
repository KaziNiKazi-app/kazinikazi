from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import get_current_admin
from app.schemas.admin import AdminStats
from app.models.user import User
from app.models.employer import Employer
from app.models.job import Job
from app.models.application import Application

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_employers = db.query(func.count(Employer.id)).scalar()
    total_jobs = db.query(func.count(Job.id)).scalar()
    active_jobs = db.query(func.count(Job.id)).filter(Job.status == "active").scalar()
    total_applications = db.query(func.count(Application.id)).scalar()
    pending_applications = db.query(func.count(Application.id)).filter(Application.status == "pending").scalar()
    
    return AdminStats(
        total_users=total_users,
        total_employers=total_employers,
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_applications=total_applications,
        pending_applications=pending_applications
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.delete("/employers/{employer_id}")
def delete_employer(
    employer_id: str,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    employer = db.query(Employer).filter(Employer.id == employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    db.delete(employer)
    db.commit()
    
    return {"message": "Employer deleted successfully"}