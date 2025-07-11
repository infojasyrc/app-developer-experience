from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from infrastructure.settings import get_settings
from api.routes import router as api_router


def get_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(**settings.fastapi_kwargs)
    app.include_router(api_router)
    return CORSMiddleware(
        app,
        allow_origins=settings.allowed_hosts,
        allow_credentials=True,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )
