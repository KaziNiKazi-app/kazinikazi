from typing import List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_employer, get_current_user
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationDetailResponse
from app.models.application import Application
from app.models.job import Job
from app.database import get_db
from app.models.user import User
from app.models.employer import Employer

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_data: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    
    job = db.query(Job).filter(Job.id == app_data.job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.application_deadline:
        deadline = job.application_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

    if deadline < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Application deadline has passed")
    
    existing = db.query(Application).filter(Application.user_id == user.id, Application.job_id == job.id).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")
    
    new_application = Application(
        user_id=user.id,
        job_id=job.id,
        status="pending"
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


@router.get("/my-applications", response_model=List[ApplicationDetailResponse])
def get_my_applications(
    status: str = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.user_id == user.id)

    if status:
        query = query.filter(Application.status == status)
    
    query = query.order_by(Application.created_at.desc())
    applications = query.offset(skip).limit(limit).all()

    result = []

    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        employer = db.query(Employer).filter(Employer.id == job.employer_id).first()

        result.append({
            **app.__dict__,
            "user_first_name": user.first_name,
            "user_last_name": user.last_name,
            "user_phone": user.phone_number,
            "user_email": user.email,
            "job_title": job.title,
            "job_company": employer.company_name
        })
    
    return result

@router.get("/job/{job_id}", response_model=List[ApplicationDetailResponse])
def get_job_applications(
    job_id: str,
    status: str = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(Application).filter(Application.job_id == job_id)
    
    if status:
        query = query.filter(Application.status == status)
    
    query = query.order_by(Application.created_at.desc())
    applications = query.offset(skip).limit(limit).all()
    
    result = []
    for app in applications:
        user = db.query(User).filter(User.id == app.user_id).first()
        
        result.append({
            **app.__dict__,
            "user_first_name": user.first_name,
            "user_last_name": user.last_name,
            "user_phone": user.phone_number,
            "user_email": user.email,
            "job_title": job.title,
            "job_company": employer.company_name
        })
    
    return result


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: str,
    update_data: ApplicationUpdate,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    job = db.query(Job).filter(Job.id == application.job_id).first()
    
    if job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    application.status = update_data.status
    
    db.commit()
    db.refresh(application)
    
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if application.status not in ["pending", "reviewing"]:
        raise HTTPException(status_code=400, detail=f"Cannot withdraw application with status: {application.status}")
    
    db.delete(application)
    db.commit()
    
    return None