"""Contract tests: models must mirror the documents written by ms-conference-api."""

from datetime import datetime, timezone

from django.contrib import admin

from manager.models import Conference, Headquarter

# Field names exactly as stored by Mongoose (headquarter.entity.ts / conference.entity.ts)
API_HEADQUARTER_FIELDS = {"city", "country", "createdBy", "updatedBy", "createdAt", "updatedAt"}
API_CONFERENCE_FIELDS = {
    "name",
    "description",
    "eventDate",
    "year",
    "type",
    "tags",
    "address",
    "status",
    "headquarter",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
}


def mongo_columns(model):
    return {field.column for field in model._meta.concrete_fields if not field.primary_key}


def test_models_are_registered_in_admin():
    assert admin.site.is_registered(Headquarter)
    assert admin.site.is_registered(Conference)


def test_models_map_to_api_collections():
    assert Headquarter._meta.db_table == "headquarters"
    assert Conference._meta.db_table == "conferences"


def test_headquarter_columns_match_api_schema():
    assert mongo_columns(Headquarter) == API_HEADQUARTER_FIELDS


def test_conference_columns_match_api_schema():
    assert mongo_columns(Conference) == API_CONFERENCE_FIELDS


def test_conference_status_choices_match_api_enum():
    assert set(Conference.Status.values) == {"active", "inactive", "created"}


def test_model_str():
    assert str(Headquarter(city="Bogota", country="Colombia")) == "Bogota, Colombia"
    assert str(Conference(name="Google IO", event_date=datetime(2026, 5, 8, tzinfo=timezone.utc))) == "Google IO"


def test_admin_is_read_only():
    for model in (Headquarter, Conference):
        model_admin = admin.site._registry[model]
        assert model_admin.has_add_permission(None) is False
        assert model_admin.has_change_permission(None) is False
        assert model_admin.has_delete_permission(None) is False
