import pytest
from unittest.mock import MagicMock
import git
import click

from core.repo import validate_git_repo


def test_validate_git_repo_valid(mocker):
    mock_repo = mocker.patch('git.Repo')
    mock_repo.return_value = MagicMock(working_dir='/path/to/repo')
    mocked_print = mocker.patch('builtins.print')

    repo = validate_git_repo()

    mocked_print.assert_called_with("📁 Monorepo detected: /path/to/repo")
    assert repo.working_dir == '/path/to/repo'


def test_validate_git_repo_invalid(mocker):
    mock_repo = mocker.patch('git.Repo')
    mock_repo.side_effect = git.exc.InvalidGitRepositoryError
    mocked_echo = mocker.patch('click.echo')

    with pytest.raises(SystemExit) as excinfo:
        validate_git_repo()

    mocked_echo.assert_called_with("Error: Not a valid Git repository.")
    assert excinfo.value.code == 1
