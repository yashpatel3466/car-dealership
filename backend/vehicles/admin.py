from django.contrib import admin

from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["make", "model", "category", "price", "quantity"]
    list_filter = ["category"]
    search_fields = ["make", "model"]
