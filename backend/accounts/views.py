from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, RoleAwareTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register — public endpoint to create a new customer account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """POST /api/auth/login — exchanges username/password for a JWT pair."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RoleAwareTokenObtainPairSerializer
