import os
from typing import Dict

from core.constants import Environment


def get_environ_variables() -> Dict:
    """
    Get the environment variables

    Returns:
        Dict: The environment variables
    """
    environ = os.environ.get('ENVIRONMENT', Environment.DEVELOPMENT)
    db_username = os.environ.get('DB_ROOT_USERNAME', 'root')
    db_password = os.environ.get('DB_ROOT_PASSWORD')
    db_host = os.environ.get('DB_HOST', 'localhost')
    return {
        'environment': environ,
        'db_username': db_username,
        'db_password': db_password,
        'db_host': db_host,
        'db_port': os.environ.get('DB_PORT', 27017),
        'default_db': os.environ.get('DEFAULT_DB', 'conference'),
    }


def get_database_url() -> str:
    """
    Get the database URL

    Returns:
        str: The database URL
    """
    environ = get_environ_variables()
    return f"mongodb://{environ['db_username']}:{environ['db_password']}@{environ['db_host']}:{environ['db_port']}/{environ['default_db']}?authSource=admin"
