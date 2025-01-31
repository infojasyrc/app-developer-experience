import typer
from db.migrations.migration_01 import run_migration


app = typer.Typer()


@app.command()
async def migrate():
    """Run database migrations."""
    await run_migration()
    typer.echo("Migrations completed successfully!")


if __name__ == "__main__":
    app()
