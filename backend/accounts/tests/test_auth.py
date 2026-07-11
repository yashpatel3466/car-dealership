"""
Red-Green-Refactor log (see commit history for the real narrative):

RED   -> wrote these tests against endpoints that didn't exist yet
         (register/login returned 404).
GREEN -> implemented RegisterSerializer/RegisterView and swapped in
         SimpleJWT's TokenObtainPairView to make every test below pass.
REFACTOR -> extracted RoleAwareTokenObtainPairSerializer so the JWT
         payload carries `role`, instead of the frontend making a second
         call just to learn if a user is an admin.
"""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")

    def test_register_creates_user_with_customer_role(self):
        payload = {"username": "alice", "email": "alice@example.com", "password": "supersecret123"}

        response = self.client.post(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="alice")
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertNotIn("password", response.data)

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(username="bob", password="supersecret123")

        response = self.client.post(
            self.url, {"username": "bob", "email": "bob2@example.com", "password": "supersecret123"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_register_rejects_short_password(self):
        response = self.client.post(
            self.url, {"username": "carol", "email": "carol@example.com", "password": "short"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registered_user_cannot_self_promote_to_admin(self):
        response = self.client.post(
            self.url,
            {
                "username": "dave",
                "email": "dave@example.com",
                "password": "supersecret123",
                "role": "admin",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="dave")
        self.assertEqual(user.role, User.Role.CUSTOMER)


class LoginTests(APITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.user = User.objects.create_user(username="erin", password="supersecret123")

    def test_login_with_valid_credentials_returns_jwt_pair(self):
        response = self.client.post(self.url, {"username": "erin", "password": "supersecret123"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_wrong_password_is_rejected(self):
        response = self.client.post(self.url, {"username": "erin", "password": "wrong-password"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_unknown_username_is_rejected(self):
        response = self.client.post(self.url, {"username": "nobody", "password": "whatever123"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
