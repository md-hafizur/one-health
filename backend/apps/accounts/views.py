from .models import Role, User
from apps.address.models import Address
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, VerifyOTPSerializer, SendVerificationSerializer
from apps.address.serializers import AddressSerializer, UserProfileSerializer
from core.authentication.auth import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from core.utils.emailer import EmailSender
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from functools import lru_cache
from typing import Dict, Callable, Any
from core.utils.code_generate import generate_verification_code
from django.db import transaction
from concurrent.futures import ThreadPoolExecutor
from rest_framework.parsers import MultiPartParser, FormParser
import json
import logging


logger = logging.getLogger(__name__)

class RegisterUserView(APIView):
    """
    FASTEST & MOST OPTIMIZED approach for Django REST API
    Uses dictionary mapping with pre-computed handlers
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]  # Allow public access for registration
    
    def __init__(self):
        super().__init__()
        # Pre-compute handlers for O(1) lookup (FASTEST)
        self.account_handlers: Dict[str, Callable] = {
            'self': self._setup_self_account,
            'public': self._setup_public_account,
            'sub_account': self._setup_sub_account,
        }

        # Thread pool for background tasks
        self.thread_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix='email-sender')
    
        
        # Cache role objects to avoid repeated DB queries
        self._role_cache = {}


    def get_parser_classes(self):
        account_type = self.request.query_params.get("for_account")
        if account_type == "public":
            return [MultiPartParser, FormParser, JSONParser]
        return [JSONParser]

    
    @lru_cache(maxsize=32)
    def _get_role_cached(self, role_name: str):
        """Cache role objects to avoid repeated DB queries"""
        return get_object_or_404(Role, name=role_name)

    
    def post(self, request, *args, **kwargs):
        """
        Register a new user with MAXIMUM PERFORMANCE
        """
        try:
            # Fast validation
            identity = request.GET.get('identity')
            if identity != 'DataCollector':
                return self._error_response("Only data collectors can register users", 403)
            
            for_account = request.GET.get('for_account')
            
            # O(1) lookup - FASTEST approach
            handler = self.account_handlers.get(for_account)
            if not handler:
                return self._error_response("Invalid account type", 400)
            
            # Prepare user data
            user_data = self._prepare_user_data_optimized(request)
            
            # Execute handler (O(1) lookup)
            user_data = handler(user_data, request)
            
            # Create user and send to complete registration
            match for_account:
                case 'self':
                    return self._data_collector_registration(user_data)
                case 'public':
                    return self._public_user_registration(request,user_data)
                case 'sub_account':
                    ...
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return self._error_response("Registration failed", 500)
    
    def _prepare_user_data_optimized(self, request) -> Dict[str, Any]:
        """Optimized user data preparation with minimal operations"""

        account_for = request.GET.get('for_account')

        if account_for == 'public':

            """Prepare and attach user_data and user_profile including uploaded files"""

            user_data = request.data.copy()

            # Step 1: Parse JSON fields
            user_data_json = json.loads(user_data.get('user_data', '{}'))
            user_profile_json = json.loads(user_data.get('user_profile', '{}'))

            # Step 2: Get files from request.FILES
            photo = request.FILES.get('user_profile.photo')
            signature = request.FILES.get('user_profile.signature')

            # Step 3: Attach photo and signature to user_profile
            if photo:
                user_profile_json['photo'] = photo
            if signature:
                user_profile_json['signature'] = signature

            # Step 4: Determine contact info (for username fallback)
            phone = user_data_json.get('phone') or user_profile_json.get('phone')
            email = user_data_json.get('email') or user_profile_json.get('email')
            username = phone or email

            if not username or username == '-':
                raise ValueError("Insufficient data to generate username")

            user_data_json['username'] = username
            user_data_json['password'] = generate_verification_code()
            user_data_json['confirm_password'] = user_data_json['password']

            # Step 5: Final structure to return
            return {
                "user_data": user_data_json,
                "user_profile": user_profile_json,
            }
        user_data = request.data.copy()
        phone = user_data.get('phone')
        email = user_data.get('email')
        
        # Fastest username generation (short-circuit evaluation)
        user_data['username'] = (
            phone or 
            email or 
            f"{user_data.get('first_name', '')}-{user_data.get('last_name', '')}"
        )
        
        if not user_data['username'] or user_data['username'] == '-':
            raise ValueError("Insufficient data to generate username")

        
        return user_data
    
    def _setup_self_account(self, user_data: Dict[str, Any], request) -> Dict[str, Any]:
        """Setup self account (cached role lookup)"""
        # For public registration, we can't validate against request.user
        # You might want to add alternative validation here
        user_data['role'] = self._get_role_cached('dataCollector').id
        return user_data
    
    def _setup_public_account(self, user_data: Dict[str, Any], request) -> Dict[str, Any]:
        """Setup public account (cached role lookup)"""
        # For public registration, you might need to handle this differently
        # Perhaps use a default data collector or require it in the request
        user_data['role'] = self._get_role_cached('public').id
        return user_data
    
    def _setup_sub_account(self, user_data: Dict[str, Any], request) -> Dict[str, Any]:
        """Setup sub account with optimized validation"""
        parent_id = user_data.get('parent')
        if not parent_id:
            raise ValueError("Parent ID is required for sub-account")
        
        # Optimized parent validation (cache if needed)
        parent_user = get_object_or_404(User, pk=parent_id)
        
        # Optimize username generation
        contact = user_data.get('phone') or user_data.get('email')
        if contact:
            user_data['username'] = f"sub_{contact}"
        
        user_data.update({
            'parent': parent_user.id,
            'role': self._get_role_cached('public').id
        })
        return user_data


    def _data_collector_registration(self, user_data: Dict[str, Any]):
        """Optimized user creation with threaded email sending"""

        # Determine which contact is present
        contact_type = 'phone' if user_data.get('phone') else 'email'
        contact = user_data.get(contact_type)

        print("contact_type", contact_type, "contact", contact)
        # send welcome message to the contact, verify the contact, and pay fee for complete registration

        serializer = UserSerializer(data=user_data)
        
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        
        #! Send welcome message, verify contact, and pay fee for complete registration in background thread (non-blocking)
        # self._send_complete_registration_message_async(user, contact_type, contact)
        
        respose_data = {
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": user.get_full_name(),
            "application_id": user.id,
            "contact": contact,
            "contact_type": contact_type
        }

        
        return Response({
            "data": respose_data,
            "message": "User created successfully."
        }, status=status.HTTP_201_CREATED)

    def _generate_password(self):
        """Generate a random password"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=12))

    @transaction.atomic
    def _public_user_registration(self, request, user_data: Dict[str, Any]):
        """Atomic public user registration: all-or-nothing"""

        public_role = self._get_role_cached('public')

        # Extract files from request.FILES

        print("request user", request.user)

        public_user_data = {
            "role": public_role.id,
            "addBy": request.user.id if request.user and request.user.is_authenticated else None,
            **user_data.get('user_data', {})
        }

        print("public_user_data(((())))", public_user_data)

        # Step 1: Create user
        user_serializer = UserSerializer(data=public_user_data)
        if not user_serializer.is_valid():
            return Response(
                {"errors": user_serializer.errors, "context": "user creation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = user_serializer.save()

        # Step 2: Create user profile
        user_profile_data = {
            "user": user.id,
            **user_data.get("user_profile", {})
        }

        profile_serializer = UserProfileSerializer(data=user_profile_data)
        if not profile_serializer.is_valid():
            # Raise rollback explicitly
            transaction.set_rollback(True)
            return Response(
                {"errors": profile_serializer.errors, "context": "user profile creation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user_profile = profile_serializer.save()

        # Step 3: Contact method
        contact_type = 'phone' if user_data['user_data'].get('phone') else 'email'
        contact = user_data['user_data'].get(contact_type)

        # Step 4: Background tasks (non-blocking)
        self._send_complete_registration_message_async(user, contact_type, contact)

        # Step 5: Return response
        response_data = {
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": user.get_full_name(),
            "application_id": user.id,
            "contact": contact,
            "contact_type": contact_type
        }

        return Response(response_data, status=status.HTTP_201_CREATED)



    def _send_complete_registration_message_async(self, user, contact_type, contact):
        def send_content(user, contact_type, contact):
            match contact_type:
                case 'phone':
                    ...
                case 'email':
                    try:
                        recipient = contact
                        
                        if recipient:
                            # Send email in background thread
                            EmailSender()\
                                .set_subject("Complete Registration")\
                                .set_message(f"Welcome to our platform! You should verify your {contact_type} and pay fee to complete registration")\
                                .set_recipients(recipient)\
                                ()
                            
                            logger.info(f"Verification email sent to {recipient}")
                            
                    except Exception as e:
                        logger.error(f"Background email sending failed: {str(e)}")

        #! Method 1: Using ThreadPoolExecutor (RECOMMENDED)
        # self.thread_pool.submit(send_content, user, contact_type, contact)
        
        logger.info(f"Welcome message sent to {contact}")

    
    def __del__(self):
        """Clean up thread pool when view is destroyed"""
        if hasattr(self, 'thread_pool'):
            self.thread_pool.shutdown(wait=False)
    def _error_response(self, message: str, status_code: int):
        """Optimized error response"""
        return Response(
            {"error": message}, 
            status=status_code
        )


''' 
Data collector email or phone verification view

'''
class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            return Response(data = serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendVerificationView(APIView):
    def __init__(self):
        super().__init__()
        self.thread_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix='email-sender')

    def post(self, request):
        serializer = SendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            print("serializer.validated_data", serializer.validated_data)
            user = serializer.validated_data['user']
            contact_type = serializer.validated_data['contact_type']
            # Generate OTP
            otp = generate_verification_code()
             # send otp via email or phone
            match contact_type:
                case 'phone':
                    user.phone_code = otp
                    ...
                case 'email':
                    user.email_code = otp
                    self._send_verification_async(user, otp)
            
            user.save(update_fields=['phone_code' if contact_type == 'phone' else 'email_code'])
            return Response({
                "send_otp": True,
                "user_id": user.id,
                "message": "Verification code sent successfully."
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_verification_async(self, user, otp):
        """Send verification using threading for better performance"""
        def send_email_task():
            try:
                verification_code = otp
                recipient = user.phone or user.email
                
                if recipient:
                    # Cache the verification code for later validation
                    cache_key = f"verification_{user.id}"
                    cache.set(cache_key, verification_code, timeout=300)  # 5 minutes
                    
                    # Send email in background thread
                    EmailSender()\
                        .set_subject("Verify Your Account")\
                        .set_message(f"Your verification code is {verification_code}")\
                        .set_recipients(recipient)\
                        ()
                    
                    logger.info(f"Verification email sent to {recipient}")
                    
            except Exception as e:
                logger.error(f"Background email sending failed: {str(e)}")
        
        #! Method 1: Using ThreadPoolExecutor (RECOMMENDED)
        # self.thread_pool.submit(send_email_task)

    def __del__(self):
        """Clean up thread pool when view is destroyed"""
        if hasattr(self, 'thread_pool'):
            self.thread_pool.shutdown(wait=False)


class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user

        # ✅ Only top-level users added by this user
        users = User.objects.filter(addBy=user, parent__isnull=True)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)