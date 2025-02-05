from fastapi import FastAPI
from fastapi_admin.app import app as admin_app
from fastapi_admin.providers.login import UsernamePasswordProvider

from models import Admin


def set_admin(app: FastAPI):
    """Sets up the admin interface"""
    login_provider = UsernamePasswordProvider(
        admin_model=Admin,
        login_logo_url="https://preview.tabler.io/static/logo.svg"
    )
    admin_app.configure(
        logo_url="https://preview.tabler.io/static/logo-white.svg",
        template_folders=["templates"],
        providers=[login_provider],
        redis=None,
    )
    app.mount("/admin", admin_app)
