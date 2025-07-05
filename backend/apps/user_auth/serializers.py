from typing import Required
from rest_framework import serializers
from apps.user_auth.models import Session


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField()
    remember = serializers.BooleanField(default=False)

    def validate(self, data):
        phone = data.get("phone")
        email = data.get("email")

        # validate if email or phone is provided
        if not email and not phone:
            raise serializers.ValidationError(
                {"contact": "Phone number or email is required"}
            )
        if phone:
            if not phone.isnumeric():
                raise serializers.ValidationError({"phone": "Phone number must be numeric"})
            if len(phone) != 11:
                raise serializers.ValidationError(
                    {"phone": "Phone number must be 11 digits"}
                )
        else:
            if not email:
                raise serializers.ValidationError({"email": "Email is required"})
        return data


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = "__all__"
