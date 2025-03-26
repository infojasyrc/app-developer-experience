import click
import inquirer
import re

from core.repo import validate_git_repo
from constants import CONVENTIONAL_TYPES


# repo = validate_git_repo()

@click.group()
def cli():
    """Monorepo Commit CLI - A tool for handling commits in a monorepo"""
    pass

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

        repo.git.add(A=True)  # Add all changes
        repo.git.commit(m=commit_msg)
        click.echo("✅ Commit successful!")

@cli.command()
def status():
    """Show changed files in the monorepo."""
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
