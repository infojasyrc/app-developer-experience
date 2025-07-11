from fastapi import APIRouter

from api.healthcheck import router as healthcheck_router


router = APIRouter(prefix="/api", tags=["API"])

# Include the healthcheck router
router.include_router(healthcheck_router)
