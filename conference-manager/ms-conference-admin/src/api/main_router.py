from fastapi import APIRouter

from api.v1.health import router as health_router

main_router = APIRouter()

main_router.include_router(health_router)
