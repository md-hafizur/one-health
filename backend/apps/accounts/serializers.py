# # accounts/serializers.py
from rest_framework import serializers
from .models import User, Role
from core.constants import UserRole
from datetime import datetime

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


class VerifyOTPSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role_id = serializers.IntegerField()
    email = serializers.EmailField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_null=True)
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        user_id = data.get("user_id")
        otp = data.get("otp")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        contact_fields = {
            'email': {
                'code_field': 'email_code',
                'verify_field': 'email_verified',
                'error': 'Invalid OTP for email.'
            },
            'phone': {
                'code_field': 'phone_code',
                'verify_field': 'phone_verified',
                'error': 'Invalid OTP for phone.'
            }
        }

        for field, config in contact_fields.items():
            value = data.get(field)
            if value and getattr(user, field) == value:
                if getattr(user, config['code_field']) != otp:
                    raise serializers.ValidationError({field: config['error']})

                # Update verification status
                setattr(user, config['verify_field'], True)
                setattr(user, config['code_field'], None)
                user.save()

                # Get fee breakdown from role
                fee = None
                if user.role:
                    try:
                        fee = user.role.payment_fee
                    except PaymentFee.DoesNotExist:
                        pass

                fee_data = {
                    "registration_fee": f"৳{fee.amount}" if fee else "N/A",
                    "verification_fee": f"৳{fee.verification_fee}" if fee else "N/A",
                    "processing_fee": f"৳{fee.processing_fee}" if fee else "N/A",
                    "total_amount": f"৳{fee.total_amount}" if fee else "N/A"
                }

                return {
                    "application_id": f"APP-{user.id:06}",
                    "applicant_name": user.get_full_name() or user.username,
                    "verified_contact": "Phone Number" if field == "phone" else "Email",
                    "verification_method": "Phone Number" if field == "phone" else "Email",
                    "verification_status": "Verified",
                    "submitted": datetime.now().strftime("%Y-%m-%d"),
                    "fees": fee_data
                }

        raise serializers.ValidationError("No valid contact field matched or provided.")

