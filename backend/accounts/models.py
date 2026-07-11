from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.

    We extend Django's built-in AbstractUser rather than rolling our own
    from scratch so we keep password hashing, permissions, and the admin
    site for free, while adding a `role` field to distinguish dealership
    staff (who can delete/restock vehicles) from ordinary customers
    (who can browse and purchase).
    """

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CUSTOMER = "customer", "Customer"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    @property
    def is_dealership_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    def __str__(self) -> str:
        return self.username
