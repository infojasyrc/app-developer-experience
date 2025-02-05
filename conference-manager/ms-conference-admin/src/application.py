from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.settings import get_settings
from db.connection import connect_to_db
from api.main_router import main_router
from admin import set_admin


# run migrations
from db.migrations.migration_01 import run_migration


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context manager for the FastAPI application lifespan"""
    # Connect to the database
    await connect_to_db()

    # Run migrations
    await run_migration()

    yield


def get_core_app() -> FastAPI:
    """Initializes the FastAPI application"""
    settings = get_settings()

    app = FastAPI(lifespan=lifespan, **settings.fastapi_kwargs)

    include_routers(app)
    add_admin(app)

    return app


def get_application() -> CORSMiddleware:
    """Returns a FastAPI application with CORS middleware"""
    settings = get_settings()

    app = get_core_app()

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


def add_admin(app: FastAPI) -> None:
    """Adds an admin interface to the FastAPI application"""
    set_admin(app=app)
