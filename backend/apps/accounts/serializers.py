# # accounts/serializers.py
from rest_framework import serializers
from accounts.models import User, Role
from core.validators import PhoneValidator
from core.constants import UserRole

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'label']


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer()  # if you want to return role object
    # or: role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())

    class Meta:
        model = User
        fields = ['id', 'username', 'phone', 'role', 'parent']

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
