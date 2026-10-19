"""Align the unmanaged models with the collections written by ms-conference-api.

Both models are ``managed = False``: no collection is created or altered here, only the Django
migration state changes. The API creates the collections and their indexes.
"""

import django.db.models.deletion
import django_mongodb_backend.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("manager", "0002_conference"),
    ]

    operations = [
        migrations.DeleteModel(name="Conference"),
        migrations.DeleteModel(name="Headquarter"),
        migrations.CreateModel(
            name="Headquarter",
            fields=[
                (
                    "id",
                    django_mongodb_backend.fields.ObjectIdAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("city", models.CharField(max_length=255)),
                ("country", models.CharField(max_length=255)),
                ("created_by", models.CharField(db_column="createdBy", max_length=255)),
                ("updated_by", models.CharField(blank=True, db_column="updatedBy", max_length=255, null=True)),
                ("created_at", models.DateTimeField(db_column="createdAt")),
                ("updated_at", models.DateTimeField(db_column="updatedAt")),
            ],
            options={
                "verbose_name_plural": "Headquarters",
                "db_table": "headquarters",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="Conference",
            fields=[
                (
                    "id",
                    django_mongodb_backend.fields.ObjectIdAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("event_date", models.DateTimeField(db_column="eventDate")),
                ("year", models.CharField(max_length=4)),
                ("type", models.CharField(max_length=255)),
                ("tags", models.CharField(max_length=255)),
                ("address", models.CharField(max_length=255)),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("inactive", "Inactive"), ("created", "Created")],
                        max_length=20,
                    ),
                ),
                ("created_by", models.CharField(db_column="createdBy", max_length=255)),
                ("updated_by", models.CharField(blank=True, db_column="updatedBy", max_length=255, null=True)),
                ("created_at", models.DateTimeField(db_column="createdAt")),
                ("updated_at", models.DateTimeField(db_column="updatedAt")),
                (
                    "headquarter",
                    models.ForeignKey(
                        blank=True,
                        db_column="headquarter",
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to="manager.headquarter",
                    ),
                ),
            ],
            options={
                "verbose_name_plural": "Conferences",
                "db_table": "conferences",
                "managed": False,
            },
        ),
    ]
