from enum import Enum


class Environment(str, Enum):
    """Enum representing the different environments."""
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"
