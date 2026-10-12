from django.contrib import admin

from .models import Conference, Headquarter

admin.site.register(Headquarter)
admin.site.register(Conference)
