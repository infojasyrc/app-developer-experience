from fastapi import APIRouter
from typing_extensions import TypedDict


router = APIRouter(prefix="/healthcheck", tags=["healthcheck"])


@router.get("/")
def healthcheck() -> TypedDict("Health", { "status": str }):
    """Return the status of the service"""
    return {"status": "ok"}
