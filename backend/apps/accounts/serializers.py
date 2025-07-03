# # accounts/serializers.py
from rest_framework import serializers
from .models import User, Role
from core.constants import UserRole

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'label']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # all fields
        fields = "__all__"

        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
        }


    def validate(self, attrs):

        phone = attrs.get('phone')
        email = attrs.get('email')
        parent = attrs.get('parent')
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password != confirm_password:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        if not parent and phone and User.objects.filter(phone=phone, parent__isnull=True).exists():
            raise serializers.ValidationError({"phone": "Phone number must be unique for main users (non-sub users)."})

        if not phone and not email:
            raise serializers.ValidationError({
                "unique_field_error": "Either phone or email must be provided.",
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        user = User.objects.create_user(**validated_data)
        return user

    
    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# from .models import UserProfile

# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = "__all__"

#     def validate(self, data):
#         user = self.context['request'].user
#         role = getattr(user, 'role', None)

#         errors = {}

#         if role == 'PublicUser':
#             required_fields = ['father_name', 'mother_name']
#             for field in required_fields:
#                 if not data.get(field):
#                     errors[field] = f"{field.replace('_', ' ').title()} is required for public users."

#         if errors:
#             raise serializers.ValidationError(errors)

#         return data
