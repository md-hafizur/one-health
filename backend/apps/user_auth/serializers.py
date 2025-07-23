from typing import Required
from rest_framework import serializers
from apps.user_auth.models import Session


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField()
    remember = serializers.BooleanField(default=False)
    account_type = serializers.CharField(required=False)

    def validate(self, data):
        phone = data.get("phone")
        email = data.get("email")
        account_type = data.get("account_type")

        # validate if account type is provided
        if not account_type:
            raise serializers.ValidationError({"account_type": "Account type is required"})

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


class ApprovedRejectedUserSerializer(serializers.Serializer):
    identity = serializers.CharField(required=True)
    user_id = serializers.IntegerField(required=True)
    contact = serializers.CharField(required=True)
    approved = serializers.BooleanField(allow_null=True, required=False)
    rejected = serializers.BooleanField(allow_null=True, required=False)

    def validate(self, data):
        identity = data.get("identity")
        user_id = data.get("user_id")
        contact = data.get("contact")
        approved = data.get("approved")
        rejected = data.get("rejected")
        if not identity:
            raise serializers.ValidationError({"identity": "Identity is required"})
        if not user_id:
            raise serializers.ValidationError({"user_id": "User ID is required"})
        if not contact:
            raise serializers.ValidationError({"contact": "Contact is required"})
        if approved is None and rejected is None:
            raise serializers.ValidationError(
                {"action": "Approved or rejected is required"}
            )
        return data
