from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from vehicles.models import Vehicle

User = get_user_model()


class VehicleSearchTests(APITestCase):
    def setUp(self):
        self.url = reverse("vehicle-search")
        self.user = User.objects.create_user(username="searcher", password="pw12345678")
        self.client.force_authenticate(self.user)

        Vehicle.objects.create(
            make="Toyota", model="Camry", category=Vehicle.Category.SEDAN, price=Decimal("25000"), quantity=3
        )
        Vehicle.objects.create(
            make="Toyota", model="RAV4", category=Vehicle.Category.SUV, price=Decimal("32000"), quantity=1
        )
        Vehicle.objects.create(
            make="Ford", model="Mustang", category=Vehicle.Category.COUPE, price=Decimal("45000"), quantity=0
        )

    def _makes(self, response):
        return sorted(item["make"] for item in response.data["results"])

    def test_search_by_make(self):
        response = self.client.get(self.url, {"make": "toyota"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_search_by_model_is_case_insensitive_partial_match(self):
        response = self.client.get(self.url, {"model": "must"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["model"], "Mustang")

    def test_search_by_category(self):
        response = self.client.get(self.url, {"category": "suv"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["model"], "RAV4")

    def test_search_by_price_range(self):
        response = self.client.get(self.url, {"min_price": "26000", "max_price": "40000"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["model"], "RAV4")

    def test_search_combines_multiple_filters(self):
        response = self.client.get(self.url, {"make": "toyota", "max_price": "30000"})

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["model"], "Camry")

    def test_search_with_no_matches_returns_empty_list(self):
        response = self.client.get(self.url, {"make": "Tesla"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_search_with_invalid_price_returns_400(self):
        response = self.client.get(self.url, {"min_price": "not-a-number"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
