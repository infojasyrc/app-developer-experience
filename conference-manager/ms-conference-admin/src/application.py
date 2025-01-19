from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.settings import get_settings
from api.main_router import main_router


def get_application() -> CORSMiddleware:
    """Returns a FastAPI application with CORS middleware"""
    settings = get_settings()

    app = FastAPI(**settings.fastapi_kwargs)

    include_routers(app)

    return CORSMiddleware(
        app,
        allow_origins=settings.allowed_hosts,
        allow_credentials=True,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )


def include_routers(app: FastAPI) -> None:
    """Includes routers in the FastAPI application"""

    app.include_router(main_router)
