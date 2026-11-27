import click
import inquirer
import re

from ade_core import __version__ as ENGINE_VERSION
from core.repo import validate_git_repo
from constants import CLI_VERSION, CONVENTIONAL_TYPES
from commands.list_cmd import list_artifacts
from commands.new import new


@click.group()
@click.version_option(CLI_VERSION, prog_name="appdevexp", message=f"%(prog)s %(version)s (ade-core {ENGINE_VERSION})")
def cli():
    """appdevexp - scaffold projects from ADE templates and handle monorepo commits."""
    pass


cli.add_command(new)
cli.add_command(list_artifacts)

@cli.command()
@click.option("-m", "--message", help="Commit message", required=False)
@click.option("--dry-run", is_flag=True, help="Show changes without committing")
def commit(message, dry_run):
    """
    Create a conventional commit with optional interactive mode.
    """
    if message:
        commit_msg = validate_commit_message(message)
    else:
        commit_msg = interactive_commit()

    if commit_msg:
        if dry_run:
            click.echo(f"[Dry Run] Commit message: {commit_msg}")
            return

        repo = validate_git_repo()
        repo.git.add(A=True)  # Add all changes
        repo.git.commit(m=commit_msg)
        click.echo("✅ Commit successful!")

@cli.command()
def status():
    """Show changed files in the monorepo."""
    repo = validate_git_repo()
    changes = [item.a_path for item in repo.index.diff(None)]
    if changes:
        click.echo("🔄 Modified files:")
        for file in changes:
            click.echo(f"  - {file}")
    else:
        click.echo("✔ No changes detected.")

def validate_commit_message(message):
    """Validate commit message format."""
    pattern = re.compile(rf"^({'|'.join(CONVENTIONAL_TYPES)})(\(.+\))?: .+")
    if not pattern.match(message):
        click.echo("❌ Invalid commit message format. Use Conventional Commits:")
        click.echo("   Example: feat(auth): add login feature")
        exit(1)
    return message

def interactive_commit():
    """Interactive commit message creation."""
    questions = [
        inquirer.List("type", message="Select commit type", choices=CONVENTIONAL_TYPES),
        inquirer.Text("scope", message="Scope (optional, e.g., auth, db)"),
        inquirer.Text("description", message="Commit description"),
    ]
    answers = inquirer.prompt(questions)

    if not answers["description"]:
        click.echo("❌ Commit description is required.")
        exit(1)

    scope = f"({answers['scope']})" if answers["scope"] else ""
    return f"{answers['type']}{scope}: {answers['description']}"

if __name__ == "__main__":
    cli()
