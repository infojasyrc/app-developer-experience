"""Read-only mirrors of the collections written by ms-conference-api (Mongoose).

Field names in MongoDB are camelCase; ``db_column`` maps them to Python names.
Schema source of truth: ms-conference-api ``headquarter.entity.ts`` and ``conference.entity.ts``.
"""

from django.db import models


class Headquarter(models.Model):
    """Headquarter, stored in the ``headquarters`` collection."""

    city = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    created_by = models.CharField(max_length=255, db_column="createdBy")
    updated_by = models.CharField(max_length=255, db_column="updatedBy", null=True, blank=True)
    created_at = models.DateTimeField(db_column="createdAt")
    updated_at = models.DateTimeField(db_column="updatedAt")

    class Meta:
        verbose_name_plural = "Headquarters"
        db_table = "headquarters"
        managed = False

    def __str__(self):
        return f"{self.city}, {self.country}"


class Conference(models.Model):
    """Conference, stored in the ``conferences`` collection."""

    class Status(models.TextChoices):
        ACTIVE = "active"
        INACTIVE = "inactive"
        CREATED = "created"

    name = models.CharField(max_length=255)
    description = models.TextField()
    event_date = models.DateTimeField(db_column="eventDate")
    year = models.CharField(max_length=4)
    type = models.CharField(max_length=255)
    tags = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices)
    headquarter = models.ForeignKey(
        Headquarter, on_delete=models.DO_NOTHING, db_column="headquarter", null=True, blank=True
    )
    created_by = models.CharField(max_length=255, db_column="createdBy")
    updated_by = models.CharField(max_length=255, db_column="updatedBy", null=True, blank=True)
    created_at = models.DateTimeField(db_column="createdAt")
    updated_at = models.DateTimeField(db_column="updatedAt")

    class Meta:
        verbose_name_plural = "Conferences"
        db_table = "conferences"
        managed = False

    def __str__(self):
        return self.name
