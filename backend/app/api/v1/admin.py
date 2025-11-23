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
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.api.deps import get_current_admin
from app.schemas.admin import AdminStats, UserResponse, EmployerResponse, JobResponse, ApplicationResponse
from app.models.user import User
from app.models.employer import Employer
from app.models.job import Job
from app.models.application import Application
from typing import List, Optional

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

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    return users

@router.get("/employers", response_model=List[EmployerResponse])
def get_all_employers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    employers = db.query(Employer).order_by(desc(Employer.created_at)).offset(skip).limit(limit).all()
    return employers

@router.get("/jobs", response_model=List[JobResponse])
def get_all_jobs(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    jobs = query.order_by(desc(Job.created_at)).offset(skip).limit(limit).all()
    return jobs

@router.get("/applications", response_model=List[ApplicationResponse])
def get_all_applications(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    applications = query.order_by(desc(Application.created_at)).offset(skip).limit(limit).all()
    return applications

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # also delete user's applications
    db.query(Application).filter(Application.user_id == user_id).delete()
    
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
    
    # also delete employer's jobs and associated applications
    jobs = db.query(Job).filter(Job.employer_id == employer_id).all()
    for job in jobs:
        db.query(Application).filter(Application.job_id == job.id).delete()
        db.delete(job)
    
    db.delete(employer)
    db.commit()
    
    return {"message": "Employer deleted successfully"}

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: str,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Also delete job's applications
    db.query(Application).filter(Application.job_id == job_id).delete()
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

@router.patch("/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    status: str,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if status not in ["active", "closed"]:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'closed'")
    
    job.status = status
    db.commit()
    db.refresh(job)
    
    return {"message": f"Job status updated to {status}", "job": job}

