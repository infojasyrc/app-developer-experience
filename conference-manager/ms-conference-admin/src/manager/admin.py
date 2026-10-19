from django.contrib import admin

from .models import Conference, Headquarter


class ReadOnlyModelAdmin(admin.ModelAdmin):
    """ms-conference-api owns writes; the admin only displays the data."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Headquarter)
class HeadquarterAdmin(ReadOnlyModelAdmin):
    list_display = ("city", "country", "created_by", "created_at", "updated_at")
    list_filter = ("country",)
    search_fields = ("city", "country")
    ordering = ("country", "city")


@admin.register(Conference)
class ConferenceAdmin(ReadOnlyModelAdmin):
    list_display = ("name", "event_date", "year", "type", "status", "headquarter", "address")
    list_filter = ("status", "type", "year")
    search_fields = ("name", "tags", "address")
    ordering = ("-event_date",)
