from functools import lru_cache
from pydantic_settings import BaseSettings
from starlette.middleware.cors import ALL_METHODS

from core.constants import Environment


class Settings(BaseSettings):
    # fastapi settings
    debug: bool = True
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"
    openapi_url: str = "/openapi.json"
    openapi_prefix: str = ""
    api_host: str = "http://localhost"
    api_port: int = 4000
    disable_write_endpoints: bool = False

    # The name of the application
    APP_NAME: str = "ms-fastapi-rest-tpl"
    # The version of the application
    APP_VERSION: str = "0.1.0"
    # The environment the application is running in
    environment: Environment = Environment.development
    # The host the application will run on
    HOST: str = ""

    # CORS settings
    allowed_hosts: list[str] = ["*"]
    allowed_methods: list[str] = ALL_METHODS
    allowed_headers: list[str] = ["*"]

    # Logging settings
    log_level: int = 20
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_date_format: str = "%Y-%m-%d %H:%M:%S"

    api_prefix: str = "/api/v1"

    # security settings
    anonymous_endpoints: dict[str, list[str] | tuple[str, ...]] = {
        "/docs": ALL_METHODS,
        "/redoc": ALL_METHODS,
        "/openapi.json": ALL_METHODS,
        "/favicon.ico": ALL_METHODS,
        "/health": ALL_METHODS,
    }
    jwt_secret_key: str = "unsecure_secret_key"
    jwt_refresh_secret_key: str = "unsecure_refresh_secret_key"
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 180
    jwt_refresh_expiration: int = 720

    @property
    def fastapi_kwargs(self) -> dict[str, any]:
        return {
            "debug": self.debug,
            "docs_url": self.docs_url,
            "redoc_url": self.redoc_url,
            "openapi_url": self.openapi_url,
            "openapi_prefix": self.openapi_prefix,
            "title": self.APP_NAME,
            "version": self.APP_VERSION,
            "host": self.HOST,
            "log_level": self.log_level,
            "log_format": self.log_format,
            "log_date_format": self.log_date_format,
            "root_path": self.api_prefix,
            "disable_write_endpoints": self.disable_write_endpoints,
        }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
