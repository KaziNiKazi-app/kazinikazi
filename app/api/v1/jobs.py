import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from app.database import get_db
from app.api.deps import get_current_employer
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobDetailResponse
from app.models.job import Job
from app.models.employer import Employer
from app.core.utils import generate_job_slug


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreate, employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    slug = generate_job_slug(job_data.title, job_id)

    new_job = Job(
        id=job_id,
        employer_id=employer.id,
        title=job_data.title,
        slug=slug,
        description=job_data.description,
        category=job_data.category,
        district=job_data.district,
        salary=job_data.salary,
        application_deadline=job_data.application_deadline,
        status="active"
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


@router.get("", response_model=List[JobResponse])
def list_jobs(
    category: Optional[str] = None,
    district: Optional[str] = None,
    min_salary: Optional[int] = None,
    status: str = "active",
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == status)

    if category:
        query = query.filter(Job.category == category)
    
    if district:
        query = query.filter(Job.district == district)
    
    if min_salary:
        query = query.filter(Job.salary >= min_salary)

    query = query.order_by(Job.created_at.desc())
    return query.offset(skip).limit(limit).all()


@router.get("/search", response_model=List[JobResponse])
def search_jobs(
    q: str = Query(..., min_length=2),
    district: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.status == "active")
    
    search_filter = or_(
        Job.title.ilike(f"%{q}%"),
        Job.description.ilike(f"%{q}%")
    )
    query = query.filter(search_filter)
    
    if district:
        query = query.filter(Job.district == district)
    
    if category:
        query = query.filter(Job.category == category)
    
    query = query.order_by(Job.created_at.desc())
    return query.offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job_detail(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    employer = db.query(Employer).filter(Employer.id == job.employer_id).first()
    
    return {
        **job.__dict__,
        "employer_name": employer.company_name
    }


@router.get("/employer/my-jobs", response_model=List[JobResponse])
def get_my_jobs(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.employer_id == employer.id)
    
    if status:
        query = query.filter(Job.status == status)
    
    query = query.order_by(Job.created_at.desc())
    return query.offset(skip).limit(limit).all()


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: str,
    job_data: JobUpdate,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    job.status = "closed"
    db.commit()
    
    return None


@router.get("/categories/list", response_model=List[str])
def get_job_categories():
    from app.core.constants import JOB_CATEGORIES
    return JOB_CATEGORIES


@router.get("/districts/list", response_model=List[str])
def get_rwanda_districts():
    from app.core.constants import RWANDA_DISTRICTS
    return RWANDA_DISTRICTS


