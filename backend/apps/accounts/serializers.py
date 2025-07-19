# # accounts/serializers.py
from rest_framework import serializers
from .models import User, Role
from core.constants import UserRole
from datetime import datetime
from django.db.models import Q
from apps.payment.models import PaymentFee

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'label']

# serializers.py
class ChildUserSerializer(serializers.ModelSerializer):
    parentAccount = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = "__all__"

        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_parentAccount(self, obj):
        return obj.parent.id if obj.parent else None



class UserSerializer(serializers.ModelSerializer):
    children = ChildUserSerializer(many=True, read_only=True)
    childCount = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    confirm_password = serializers.CharField(write_only=True)
    guardian_nid = serializers.CharField(required=False,allow_null=True)
    account_type = serializers.CharField(required=False,allow_null=True)

    class Meta:
        model = User
        # all fields
        fields = "__all__"

        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
        }

    def get_childCount(self, obj):
        return obj.children.count()

    def get_name(self, obj):
        return obj.get_full_name()


    def validate(self, attrs):

        print("attrs((((((((((()))))))))))", attrs)

        phone = attrs.get('phone')
        email = attrs.get('email')
        parent = attrs.get('parent')
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        account_type = attrs.get("account_type")
        
        if password != confirm_password:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        if account_type != "sub-account":
            if not parent and phone and User.objects.filter(phone=phone, parent__isnull=True).exists():
                raise serializers.ValidationError({"phone": "Phone number must be unique for main users (non-sub users)."})

            if not phone and not email:
                raise serializers.ValidationError({
                    "unique_field_error": "Either phone or email must be provided.",
                })
        else:
            guardian_nid = attrs.get('guardian_nid')
            parent = attrs.get('parent')  # Already a User instance

            # Validate that parent's userprofile.nid matches guardian_nid
            if not parent or not hasattr(parent, "userprofile") or parent.userprofile.nid != guardian_nid:
                raise serializers.ValidationError({
                    "parent": "Parent account not found or NID mismatch.",
                })

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        validated_data.pop('account_type', None)
        validated_data.pop('guardian_nid', None)
        user = User.objects.create_user(**validated_data)
        return user

    
    def update(self, instance, validated_data):
        validated_data.pop('account_type', None)
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        validated_data.pop('guardian_nid', None)

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
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        user_id = data.get("user_id")
        otp = data.get("otp")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        verification_attempts = [
            {
                'contact_type': 'email',
                'contact_field': user.email,
                'code_field': user.email_code,
                'verified_field': 'email_verified',
                'error_msg': 'Invalid OTP for email.',
                'verified_contact_display': 'Email',
                'verification_method_display': 'Email'
            },
            {
                'contact_type': 'phone',
                'contact_field': user.phone,
                'code_field': user.phone_code,
                'verified_field': 'phone_verified',
                'error_msg': 'Invalid OTP for phone.',
                'verified_contact_display': 'Phone Number',
                'verification_method_display': 'Phone Number'
            }
        ]

        for attempt in verification_attempts:
            if attempt['contact_field'] and not getattr(user, attempt['verified_field']):
                if attempt['code_field'] == otp:
                    # Set verified status
                    setattr(user, attempt['verified_field'], True)
                    # Explicitly set code to None
                    if attempt['contact_type'] == 'email':
                        user.email_code = None
                    elif attempt['contact_type'] == 'phone':
                        user.phone_code = None
                    user.save() # Save the user object with updated status and cleared code
                    return self._get_verification_success_data(
                        user,
                        attempt['verified_contact_display'],
                        attempt['verification_method_display']
                    )
                else:
                    raise serializers.ValidationError({"otp": attempt['error_msg']})

        # If loop finishes, no unverified contact was found or both are already verified
        if user.email_verified and user.phone_verified:
            raise serializers.ValidationError("Both email and phone are already verified.")
        elif not user.email and not user.phone:
            raise serializers.ValidationError("User has no email or phone to verify.")
        else:
            # This case should ideally not be reached if the above logic is comprehensive,
            # but it covers any remaining edge cases where an unverified contact exists
            # but wasn't caught by the loop (e.g., if contact_field is None but verified_field is False,
            # which shouldn't happen if data integrity is maintained).
            raise serializers.ValidationError("No unverified contact field found for this user.")

    def _get_verification_success_data(self, user, verified_contact, verification_method):
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
            "verified_contact": verified_contact,
            "verification_method": verification_method,
            "verification_status": "Verified",
            "submitted": datetime.now().strftime("%Y-%m-%d"),
            "fees": fee_data
        }

class SendVerificationSerializer(serializers.Serializer):
    contact = serializers.CharField()
    contact_type = serializers.CharField()
    user_id = serializers.IntegerField()

    def validate(self, data):
        user_id = data.get("user_id")
        contact = data.get("contact")
        contact_type = data.get("contact_type")

        try:
            user = User.objects.get(
                Q(id=user_id, email=contact) |
                Q(id=user_id, phone=contact)
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        data['user'] = user
        data['contact_type'] = contact_type

        return data