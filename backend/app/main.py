from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1 import auth, jobs, users, employers, applications, admin, work_tracking

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KaziNiKazi",
    description="Job marketplace platform for Rwanda's informal sector - MVP",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(employers.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(work_tracking.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "name": "KaziNiKazi",
        "description": "Job marketplace for Rwanda's informal sector - MVP",
        "docs": "/api/docs"
    }
