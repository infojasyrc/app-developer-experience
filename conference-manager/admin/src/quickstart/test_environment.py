from quickstart.environment import get_environment_variables


def test_defaults(monkeypatch):
    for name in ("DB_HOST", "DB_PORT", "DB_ROOT_USERNAME", "DB_ROOT_PASSWORD", "DEFAULT_DB", "MS_PORT"):
        monkeypatch.delenv(name, raising=False)

    assert get_environment_variables() == {
        "db_host": "localhost",
        "db_port": "27017",
        "db_root_username": "",
        "db_root_password": "",
        "default_db": "mongodb",
        "ms_port": "3000",
    }


def test_reads_environment(monkeypatch):
    monkeypatch.setenv("DB_HOST", "mongodb")
    monkeypatch.setenv("DB_PORT", "27018")
    monkeypatch.setenv("DB_ROOT_USERNAME", "user")
    monkeypatch.setenv("DB_ROOT_PASSWORD", "secret")
    monkeypatch.setenv("DEFAULT_DB", "conference")
    monkeypatch.setenv("MS_PORT", "5002")

    variables = get_environment_variables()

    assert variables["db_host"] == "mongodb"
    assert variables["db_port"] == "27018"
    assert variables["db_root_username"] == "user"
    assert variables["db_root_password"] == "secret"
    assert variables["default_db"] == "conference"
    assert variables["ms_port"] == "5002"
