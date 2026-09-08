from fastapi import FastAPI

from api.healthcheck import router as healthcheck_router
from infrastructure.settings import get_settings
from knowledge.bootstrap import load_store
from mcp_server import build_mcp


def get_application() -> FastAPI:
    settings = get_settings()
    store = load_store()
    app = FastAPI(**settings.fastapi_kwargs)
    app.include_router(healthcheck_router)
    app.state.store = store
    mcp = build_mcp(store)
    app.state.mcp = mcp
    if hasattr(mcp, "sse_app"):
        app.mount("/mcp", mcp.sse_app())
    elif hasattr(mcp, "streamable_http_app"):
        app.mount("/mcp", mcp.streamable_http_app())
    return app
