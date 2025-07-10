import logging
from fastapi.logger import logger

from application import get_application
from core.constants import Environment
from core.settings import get_settings


def launch_app():
    """Launch the FastAPI application."""
    app = get_application()
    return app


settings = get_settings()
app = launch_app()

if settings.environment == Environment.PRODUCTION.value:
    gunicorn_error_logger = logging.getLogger("gunicorn.error")
    gunicorn_logger = logging.getLogger("gunicorn")
    root_logger = logging.getLogger()

    logger.setLevel(gunicorn_logger.level)
    logger.handlers = gunicorn_logger.handlers
    root_logger.setLevel(gunicorn_logger.level)

    uvicorn_logger = logging.getLogger("uvicorn.access")
    uvicorn_logger.handlers = gunicorn_error_logger.handlers
