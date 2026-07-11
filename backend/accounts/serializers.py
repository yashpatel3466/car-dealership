from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user, used to echo the caller's identity."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new-user registration.

    `role` defaults to "customer" and is intentionally NOT settable by an
    anonymous caller to "admin" here — promoting a user to admin is left to
    Django admin / a trusted management action, not open self-registration.
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=User.Role.CUSTOMER,
        )
        return user


class RoleAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends the default JWT serializer to embed the user's role/id in the token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        return token
