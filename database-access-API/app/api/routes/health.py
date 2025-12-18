from fastapi import APIRouter

router = APIRouter(prefix="", tags=["chingu"])

from app.api.core.config import settings

@router.get("/")
def return_status() -> str:
    return f"currently querying `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`"