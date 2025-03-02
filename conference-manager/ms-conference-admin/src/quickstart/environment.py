import os
from typing import Dict


def get_environment_variables() -> Dict:
    """
        Get environment variables
    """
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "27017")
    db_root_username = os.environ.get("DB_ROOT_USERNAME", "")
    db_root_password = os.environ.get("DB_ROOT_PASSWORD", "")
    default_db = os.environ.get("DEFAULT_DB", "mongodb")
    ms_port = os.environ.get("MS_PORT", "3000")

    return {
        "db_host": db_host,
        "db_port": db_port,
        "db_root_username": db_root_username,
        "db_root_password": db_root_password,
        "default_db": default_db,
        "ms_port": ms_port,
    }
