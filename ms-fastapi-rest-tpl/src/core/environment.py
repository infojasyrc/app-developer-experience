from enum import Enum

class Environment(str, Enum):
    development = "development"
    testing = "testing"
    production = "production"