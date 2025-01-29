import logging
from fastapi import FastAPI
from fastapi.logger import logger

from application import get_application
from core.constants import Environment
from core.settings import get_settings


def get_app() -> FastAPI:
    """Returns the FastAPI application"""
    return get_application()


settings = get_settings()
app = get_app()

if settings.environment == Environment.PRODUCTION:
    gunicorn_error_logger = logging.getLogger("gunicorn.error")
    gunicorn_logger = logging.getLogger("gunicorn")
    root_logger = logging.getLogger()

    logger.setLevel(gunicorn_logger.level)
    logger.handlers = gunicorn_logger.handlers
    root_logger.setLevel(gunicorn_logger.level)

    uvicorn_logger = logging.getLogger("uvicorn.access")
    uvicorn_logger.handlers = gunicorn_error_logger.handlers
