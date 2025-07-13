from fastapi import APIRouter


router = APIRouter(prefix="/healthcheck", tags=["Healthcheck"])


@router.get("/", summary="Healthcheck endpoint")
async def healthcheck():
    """
    Healthcheck endpoint to verify the service is running.
    Returns a simple JSON response with status 'ok'.
    """
    return {"status": "ok"}
