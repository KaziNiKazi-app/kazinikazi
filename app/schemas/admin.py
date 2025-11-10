from pydantic import BaseModel

class AdminStats(BaseModel):
    total_users: int
    total_employers: int
    total_jobs: int
    active_jobs: int
    total_applications: int
    pending_applications: int