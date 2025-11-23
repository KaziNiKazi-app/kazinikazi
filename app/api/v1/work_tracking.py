from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.api.deps import get_current_user, get_current_employer
from app.schemas.work_tracking import WorkSessionCreate, WorkSessionStart, WorkSessionEnd, WorkSessionApproveStart, WorkSessionApproveEnd, WorkSessionResponse, WorkSessionSummary
from app.models.work_tracking import WorkSession
from app.models.user import User
from app.models.employer import Employer
from app.models.job import Job

router = APIRouter(
    prefix="/work-sessions",
    tags=["Work Tracking"]
)

@router.post("", response_model=WorkSessionResponse, status_code=status.HTTP_201_CREATED)
def create_work_session(
    session_data: WorkSessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == session_data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    from app.models.application import Application
    application = db.query(Application).filter(
        Application.user_id == user.id,
        Application.job_id == session_data.job_id,
        Application.status == "accepted"
    ).first()
    
    if not application:
        raise HTTPException(status_code=403, detail="You are not accepted for this job")
    
    existing_session = db.query(WorkSession).filter(
        WorkSession.user_id == user.id,
        WorkSession.job_id == session_data.job_id,
        WorkSession.work_ended == False
    ).first()
    
    if existing_session:
        raise HTTPException(status_code=400, detail="You already have an active work session for this job")
    
    new_session = WorkSession(
        user_id=user.id,
        job_id=session_data.job_id,
        employer_id=job.employer_id,
        daily_payment=session_data.daily_payment,
        start_approved=False,
        end_approved=False,
        work_started=False,
        work_ended=False
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    new_session.user_name = f"{user.first_name} {user.last_name}"
    new_session.job_title = job.title
    new_session.employer_name = job.employer.company_name
    
    return new_session

@router.post("/{session_id}/request-start", response_model=WorkSessionResponse)
def request_start_work_session(
    session_id: str,
    start_data: WorkSessionStart,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkSession).filter(WorkSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Work session not found")
    
    if session.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if session.work_started:
        raise HTTPException(status_code=400, detail="Work already started")
    
    if session.work_ended:
        raise HTTPException(status_code=400, detail="Work session already ended")
    
    if not session.start_approved:
        raise HTTPException(
            status_code=400, 
            detail="Cannot start work until employer approves the session start"
        )
    
    session.work_started = True
    session.start_time = datetime.now(timezone.utc)
    session.notes = start_data.notes
    session.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(session)
    
    session.user_name = f"{user.first_name} {user.last_name}"
    session.job_title = session.job.title
    session.employer_name = session.employer.company_name
    
    return session

@router.post("/{session_id}/request-end", response_model=WorkSessionResponse)
def request_end_work_session(
    session_id: str,
    end_data: WorkSessionEnd,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(WorkSession).filter(WorkSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Work session not found")
    
    if session.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not session.work_started:
        raise HTTPException(status_code=400, detail="Work not started yet")
    
    if session.work_ended:
        raise HTTPException(status_code=400, detail="Work already ended")
    
    session.work_ended = True
    session.end_time = datetime.now(timezone.utc)
    
    if session.start_time and session.end_time:
        if session.start_time.tzinfo is None:
            session.start_time = session.start_time.replace(tzinfo=timezone.utc)
        if session.end_time.tzinfo is None:
            session.end_time = session.end_time.replace(tzinfo=timezone.utc)
        time_diff = session.end_time - session.start_time
        session.hours_worked = round(time_diff.total_seconds() / 3600, 2)
    
    if end_data.notes:
        session.notes = f"{session.notes}\nEnd Notes: {end_data.notes}" if session.notes else f"End Notes: {end_data.notes}"
    
    session.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(session)
    
    session.user_name = f"{user.first_name} {user.last_name}"
    session.job_title = session.job.title
    session.employer_name = session.employer.company_name
    
    return session

@router.post("/{session_id}/approve-start", response_model=WorkSessionResponse)
def approve_start_work_session(
    session_id: str,
    approve_data: WorkSessionApproveStart,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    session = db.query(WorkSession).filter(WorkSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Work session not found")
    
    if session.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if session.work_started:
        raise HTTPException(status_code=400, detail="Work already started")
    
    session.start_approved = approve_data.approved
    session.employer_start_notes = approve_data.employer_notes
    session.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(session)
    
    session.user_name = f"{session.user.first_name} {session.user.last_name}"
    session.job_title = session.job.title
    session.employer_name = employer.company_name
    
    return session

@router.post("/{session_id}/approve-end", response_model=WorkSessionResponse)
def approve_end_work_session(
    session_id: str,
    approve_data: WorkSessionApproveEnd,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    session = db.query(WorkSession).filter(WorkSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Work session not found")
    
    if session.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not session.work_ended:
        raise HTTPException(status_code=400, detail="Work session not ended yet")
    
    session.end_approved = approve_data.approved
    session.employer_end_notes = approve_data.employer_notes
    session.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(session)
    
    session.user_name = f"{session.user.first_name} {session.user.last_name}"
    session.job_title = session.job.title
    session.employer_name = employer.company_name
    
    return session

@router.get("/my-sessions", response_model=List[WorkSessionResponse])
def get_my_work_sessions(
    status: Optional[str] = Query(None, description="Filter by status: pending_start, pending_end, active, completed"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(WorkSession).filter(WorkSession.user_id == user.id)
    
    if status == "pending_start":
        query = query.filter(WorkSession.start_approved == False, WorkSession.work_started == False)
    elif status == "pending_end":
        query = query.filter(WorkSession.work_ended == True, WorkSession.end_approved == False)
    elif status == "active":
        query = query.filter(WorkSession.work_started == True, WorkSession.work_ended == False)
    elif status == "completed":
        query = query.filter(WorkSession.end_approved == True)
    
    sessions = query.order_by(desc(WorkSession.created_at)).offset(skip).limit(limit).all()
    
    for session in sessions:
        session.user_name = f"{user.first_name} {user.last_name}"
        session.job_title = session.job.title
        session.employer_name = session.employer.company_name
    
    return sessions

@router.get("/employer/sessions", response_model=List[WorkSessionResponse])
def get_employer_work_sessions(
    status: Optional[str] = Query(None, description="Filter by status: pending_start, pending_end, active, completed"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    query = db.query(WorkSession).filter(WorkSession.employer_id == employer.id)
    
    if status == "pending_start":
        query = query.filter(WorkSession.start_approved == False, WorkSession.work_started == False)
    elif status == "pending_end":
        query = query.filter(WorkSession.work_ended == True, WorkSession.end_approved == False)
    elif status == "active":
        query = query.filter(WorkSession.work_started == True, WorkSession.work_ended == False)
    elif status == "completed":
        query = query.filter(WorkSession.end_approved == True)
    
    sessions = query.order_by(desc(WorkSession.created_at)).offset(skip).limit(limit).all()
    
    for session in sessions:
        session.user_name = f"{session.user.first_name} {session.user.last_name}"
        session.job_title = session.job.title
        session.employer_name = employer.company_name
    
    return sessions

@router.get("/summary", response_model=WorkSessionSummary)
def get_work_session_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_sessions = db.query(WorkSession).filter(WorkSession.user_id == user.id).count()
    
    approved_sessions = db.query(WorkSession).filter(
        WorkSession.user_id == user.id,
        WorkSession.end_approved == True
    ).count()
    
    pending_start_approval = db.query(WorkSession).filter(
        WorkSession.user_id == user.id,
        WorkSession.start_approved == False,
        WorkSession.work_started == False
    ).count()
    
    pending_end_approval = db.query(WorkSession).filter(
        WorkSession.user_id == user.id,
        WorkSession.work_ended == True,
        WorkSession.end_approved == False
    ).count()
    
    total_earnings_result = db.query(func.sum(WorkSession.daily_payment)).filter(
        WorkSession.user_id == user.id,
        WorkSession.end_approved == True
    ).scalar()
    total_earnings = total_earnings_result or 0
    
    total_hours_result = db.query(func.sum(WorkSession.hours_worked)).filter(
        WorkSession.user_id == user.id,
        WorkSession.end_approved == True
    ).scalar()
    total_hours = total_hours_result or 0
    
    return WorkSessionSummary(
        total_sessions=total_sessions,
        approved_sessions=approved_sessions,
        total_earnings=total_earnings,
        pending_start_approval=pending_start_approval,
        pending_end_approval=pending_end_approval,
        total_hours=total_hours
    )

@router.get("/employer/summary", response_model=WorkSessionSummary)
def get_employer_work_session_summary(
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    total_sessions = db.query(WorkSession).filter(WorkSession.employer_id == employer.id).count()
    
    approved_sessions = db.query(WorkSession).filter(
        WorkSession.employer_id == employer.id,
        WorkSession.end_approved == True
    ).count()
    
    pending_start_approval = db.query(WorkSession).filter(
        WorkSession.employer_id == employer.id,
        WorkSession.start_approved == False,
        WorkSession.work_started == False
    ).count()
    
    pending_end_approval = db.query(WorkSession).filter(
        WorkSession.employer_id == employer.id,
        WorkSession.work_ended == True,
        WorkSession.end_approved == False
    ).count()
    
    total_earnings_result = db.query(func.sum(WorkSession.daily_payment)).filter(
        WorkSession.employer_id == employer.id,
        WorkSession.end_approved == True
    ).scalar()
    total_earnings = total_earnings_result or 0
    
    total_hours_result = db.query(func.sum(WorkSession.hours_worked)).filter(
        WorkSession.employer_id == employer.id,
        WorkSession.end_approved == True
    ).scalar()
    total_hours = total_hours_result or 0
    
    return WorkSessionSummary(
        total_sessions=total_sessions,
        approved_sessions=approved_sessions,
        total_earnings=total_earnings,
        pending_start_approval=pending_start_approval,
        pending_end_approval=pending_end_approval,
        total_hours=total_hours
    )