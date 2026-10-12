from django.contrib import admin
from django.http import HttpResponse
from django.test import RequestFactory

from manager import views
from manager.models import Conference, Headquarter
from manager.urls import urlpatterns


def test_models_are_registered_in_admin():
    assert admin.site.is_registered(Headquarter)
    assert admin.site.is_registered(Conference)


def test_model_str_returns_name():
    assert str(Headquarter(name="Lima")) == "Lima"
    assert str(Conference(name="PyCon")) == "PyCon"


def test_models_map_to_existing_collections():
    assert Headquarter._meta.db_table == "headquarters"
    assert Conference._meta.db_table == "events"


def test_index_view():
    response = views.index(RequestFactory().get("/"))

    assert isinstance(response, HttpResponse)
    assert response.content == b"Conference Admin Manager"


def test_url_names():
    assert [pattern.name for pattern in urlpatterns] == ["index", "headquarter_list"]
