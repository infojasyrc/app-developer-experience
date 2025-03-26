import git
import click


def validate_git_repo():
    """Validate Git repository."""
    try:
        repo = git.Repo(search_parent_directories=True)
        print(f"📁 Monorepo detected: {repo.working_dir}")
    except git.exc.InvalidGitRepositoryError:
        click.echo("Error: Not a valid Git repository.")
        exit(1)
    return repo
