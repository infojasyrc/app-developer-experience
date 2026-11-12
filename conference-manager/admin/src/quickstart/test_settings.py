from django.conf import settings
from django.urls import resolve


def test_database_uses_mongodb_backend():
    assert settings.DATABASES["default"]["ENGINE"] == "django_mongodb_backend"


def test_admin_url_is_routed():
    assert resolve("/admin/login/").view_name == "admin:login"
