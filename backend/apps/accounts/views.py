import re
from .models import Role, User
from apps.address.models import Address
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ExpressionWrapper, Q, BooleanField,Count, OuterRef, Subquery, IntegerField, Exists
from .serializers import UserSerializer, VerifyOTPSerializer, SendVerificationSerializer
from apps.address.serializers import AddressSerializer, UserProfileSerializer
from core.authentication.auth import JWTAuthentication
from core.pagination.user_pagination import UserPagination
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
import random, string
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
        if account_type in  ["public", "sub_account"]:
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
                    return self._sub_account_registration(request,user_data)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return self._error_response("Registration failed", 500)
    
    def _prepare_user_data_optimized(self, request) -> Dict[str, Any]:
        """Optimized user data preparation with minimal operations"""

        account_for = request.GET.get('for_account')

        if account_for in ['public','sub_account']:

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
            phone = user_data_json.get('phone') or user_profile_json.get('phone') or None
            email = user_data_json.get('email') or user_profile_json.get('email') or None

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

        
        parent_id = user_data.get('user_data',{}).get('parent')
        if not parent_id:
            raise ValueError("Parent ID is required for sub-account")
        first_name = user_data.get('user_data',{}).get('first_name')
        last_name = user_data.get('user_data',{}).get('last_name')
        # Optimized parent validation (cache if needed)
        parent_user = get_object_or_404(User, pk=parent_id)
        
        # Parent user contact type 
        contact = parent_user.phone or parent_user.email
        if contact:
            username = f"{first_name}-{last_name}"
        
        user_data['user_data'].update({
            'parent': parent_user.id,
            'role': self._get_role_cached('subUser').id,
            'username' : username
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

        public_user_data = {
            "role": public_role.id,
            "addBy": request.user.id if request.user and request.user.is_authenticated else None,
            **user_data.get('user_data', {})
        }

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
            "account_type": "public",
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

    @transaction.atomic
    def _sub_account_registration(self, request, user_data: Dict[str, Any]):
        """Atomic sub user registration: all-or-nothing"""
        sub_role = self._get_role_cached('subUser')

        password = self._generate_password()
        user_data['user_data']['password'] = password

        sub_user_data = user_data.get('user_data', {})
        profile_data = user_data.get('user_profile', {})

        # Extract files from request.FILES

        sub_user_data = {
            "role": sub_role.id,
            "addBy": request.user.id if request.user and request.user.is_authenticated else None,
            "account_type": "sub-account",
            "guardian_nid": user_data.get('user_profile', {}).get('guardian_nid'),
            "password": password,
            **sub_user_data
        }

        # print("sub user data:", sub_user_data)

        # Step 1: Create user
        user_serializer = UserSerializer(data=sub_user_data)
        if not user_serializer.is_valid():
            return Response(
                {"errors": user_serializer.errors, "context": "user creation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = user_serializer.save()

        # Step 2: Create user profile
        user_profile_data = {
            "user": user.id,
            "account_type": "sub-account",
            **profile_data
        }
        # return Response(user_profile_data, status=status.HTTP_201_CREATED)

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
        parent_account = User.objects.filter(userprofile__nid=user_data['user_profile']['guardian_nid']).first()
        contact_type = 'phone' if parent_account.phone else 'email'
        contact = parent_account.phone if parent_account.phone else parent_account.email

        # Step 4: Background tasks (non-blocking)
        # self._send_sub_account_registration_permission_message(user, contact_type, contact,password)

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

    
    def _send_sub_account_registration_permission_message(self, user, contact_type, contact,password):
        def send_content(user, contact_type, contact, password):
            match contact_type:
                case 'phone':
                    ...
                case 'email':
                    try:
                        recipient = contact
                        
                        if recipient:
                            # Send email in background thread
                            EmailSender()\
                                .set_subject("Permission for Sub Account Registration")\
                                .set_message(
                                    f"A sub-user account has been created and is awaiting your approval. "
                                    f"To authorize this sub-account, please verify the OTP sent to your {contact_type}. "
                                    f"Sub-user Username: {user.username}, Temporary Password: {password}. "
                                    f"Complete the verification to enable access."
                                )\
                                .set_recipients(recipient)\
                                ()
                            
                            logger.info(f"Verification email sent to {recipient}")
                            
                    except Exception as e:
                        logger.error(f"Background email sending failed: {str(e)}")

        #! Method 1: Using ThreadPoolExecutor (RECOMMENDED)
        self.thread_pool.submit(send_content, user, contact_type, contact, password)


        logger.info(f"Welcome message sent to {contact}")


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
        print("request.data", request.data)
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
            account_type = serializer.validated_data.get('account_type', None)
            contact = serializer.validated_data['contact']
            # Generate OTP
            otp = generate_verification_code()
             # send otp via email or phone
            match contact_type:
                case 'phone':
                    user.phone_code = otp
                    ...
                case 'email':
                    user.email_code = otp
                    self._send_verification_async(user, otp, account_type,contact)
            
            user.save(update_fields=['phone_code' if contact_type == 'phone' else 'email_code'])
            return Response({
                "send_otp": True,
                "user_id": user.id,
                "message": "Verification code sent successfully."
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_verification_async(self, user, otp, account_type,contact):

        """Send verification using threading for better performance"""
        def send_email_task():
            try:
                verification_code = otp
                if account_type != 'sub-account':
                    recipient = user.phone or user.email
                else:
                    recipient = contact
                
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
        self.thread_pool.submit(send_email_task)

    def __del__(self):
        """Clean up thread pool when view is destroyed"""
        if hasattr(self, 'thread_pool'):
            self.thread_pool.shutdown(wait=False)


class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user

        # Base queryset
        queryset = User.objects.filter(addBy=user, parent__isnull=True).order_by('-id')

        # Filter: payment_status
        payment_status = request.GET.get('payment_status')
        if payment_status and payment_status.lower() != 'all':
            queryset = queryset.filter(payment_status=payment_status)

        # Filter: verification_status
        verification_status = request.GET.get('verification_status')
        if verification_status == 'verified':
            queryset = queryset.filter(Q(email_verified=True) | Q(phone_verified=True))
        elif verification_status == 'unverified':
            queryset = queryset.filter(Q(email_verified=False) & Q(phone_verified=False))

        # Annotate verification_status (True/False based on email or phone verified)
        queryset = queryset.annotate(
            verification_status=ExpressionWrapper(
                Q(email_verified=True) | Q(phone_verified=True),
                output_field=BooleanField()
            )
        )

        # Ordering
        ordering_field = request.query_params.get('ordering', '-id')  # default to newest
        if ordering_field.lstrip('-') == 'verification_status':
            queryset = queryset.order_by(ordering_field)  # supports both asc and desc
        else:
            # Safe fallback for known fields only (prevent SQL injection-style abuse)
            allowed_order_fields = ['id', 'first_name', 'last_name', 'email', 'payment_status']
            field_name = ordering_field.lstrip('-')
            if field_name in allowed_order_fields:
                queryset = queryset.order_by(ordering_field)

        # Pagination
        paginator = UserPagination()
        paginated_users = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(paginated_users, many=True)
        print("serializer.data", serializer.data)
        return paginator.get_paginated_response(serializer.data)


class UserLastDetail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        qqueryset = User.objects.filter(addBy=user).order_by('-id').values(
            'email_verified',
            'phone_verified',
            'payment_status',
            'first_name',
            'last_name'
        )[:3]
        return Response(qqueryset, status=status.HTTP_200_OK)

class UserStatisticsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Filter users added by current user
        base_queryset = User.objects.filter(addBy=user)

        total_registered = base_queryset.count()
        paid_users = base_queryset.filter(payment_status="Paid").count()
        pending_payments = base_queryset.exclude(payment_status="Paid").count()

        return Response({
            "total_registered": total_registered,
            "paid_users": paid_users,
            "pending_payments": pending_payments
        })


class publicUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        param = request.GET.get('param')

        # Prepare safe ID filter
        id_filter = Q()
        if param and str(param).isdigit():
            id_filter = Q(id=int(param))

        # Main user query with role filtering and parent check
        user_qs = User.objects.annotate(
            child_count=Count('children', distinct=True)
        ).filter(
            (
                Q(phone=param) |
                Q(email=param) |
                Q(first_name__icontains=param) |
                Q(last_name__icontains=param) |
                id_filter
            ) &
            ~Q(role__name__in=['dataCollector', 'admin']) &
            Q(parent__isnull=True)
        ).values("id", "first_name", "last_name", "phone", "email", "child_count").first()

        if not user_qs:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(user_qs, status=status.HTTP_200_OK)