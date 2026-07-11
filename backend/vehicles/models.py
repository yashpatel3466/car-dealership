from django.core.validators import MinValueValidator
from django.db import models


class Vehicle(models.Model):
    """A single vehicle listing in the dealership's inventory."""

    class Category(models.TextChoices):
        SEDAN = "sedan", "Sedan"
        SUV = "suv", "SUV"
        TRUCK = "truck", "Truck"
        COUPE = "coupe", "Coupe"
        VAN = "van", "Van"
        HATCHBACK = "hatchback", "Hatchback"
        OTHER = "other", "Other"

    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["make", "model"]

    def __str__(self) -> str:
        return f"{self.make} {self.model} ({self.get_category_display()})"

    @property
    def in_stock(self) -> bool:
        return self.quantity > 0
