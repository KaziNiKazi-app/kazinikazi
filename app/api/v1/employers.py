from fastapi import APIRouter, Depends
from app.schemas.employer import EmployerResponse, EmployerUpdate
from app.models.employer import Employer
from app.api.deps import get_current_employer
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/employers",
    tags=["Employers"]
)

@router.get("/me", response_model=EmployerResponse)
def get_current_employer_profile(employer: Employer = Depends(get_current_employer)):
    return employer

@router.patch("/me", response_model=EmployerResponse)
def update_employer_profile(
    employer_data: EmployerUpdate,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    update_data = employer_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employer, field, value)
    
    db.commit()
    db.refresh(employer)
    
    return employer