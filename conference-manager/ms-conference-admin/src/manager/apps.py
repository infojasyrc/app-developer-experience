from django.apps import AppConfig


class AdminmanagerConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'manager'
