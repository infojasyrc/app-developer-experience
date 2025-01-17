from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.settings import get_settings


def get_application() -> FastAPI:
    settings = get_settings()
    app = FastAPI(**settings.fastapi_kwargs)
    return CORSMiddleware(
        app,
        allow_origins=settings.allowed_hosts,
        allow_credentials=True,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )