from .models import Role, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, VerifyOTPSerializer
from core.utils.emailer import EmailSender
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from functools import lru_cache
from typing import Dict, Callable, Any
from core.utils.code_generate import generate_verification_code
from django.db import transaction
from concurrent.futures import ThreadPoolExecutor
from threading import Thread
import threading
import logging

logger = logging.getLogger(__name__)

class RegisterUserView(APIView):
    """
    FASTEST & MOST OPTIMIZED approach for Django REST API
    Uses dictionary mapping with pre-computed handlers
    """
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
            
            # Create user and send verification
            return self._create_user_and_send_verification(user_data)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return self._error_response("Registration failed", 500)
    
    def _prepare_user_data_optimized(self, request) -> Dict[str, Any]:
        """Optimized user data preparation with minimal operations"""
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
        
        # Method 1: Using ThreadPoolExecutor (RECOMMENDED)
        self.thread_pool.submit(send_email_task)
        
        # Method 2: Using simple Thread (Alternative)
        # thread = Thread(target=send_email_task, daemon=True)
        # thread.start()
    def _create_user_and_send_verification(self, user_data: Dict[str, Any]):
        """Optimized user creation with threaded email sending"""

        otp = generate_verification_code()

        # Map the contact type to the correct OTP field
        field_map = {
            'phone': 'phone_code',
            'email': 'email_code'
        }
        # Determine which contact type is present
        contact_type = 'phone' if user_data.get('phone') else 'email'
        # Set the OTP to the corresponding field dynamically
        user_data[field_map[contact_type]] = otp

        serializer = UserSerializer(data=user_data)
        
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        
        #! Send verification in background thread (non-blocking)
        # self._send_verification_async(user, otp)
        
        return Response({
            "send_otp": True,
            "data": serializer.data,
            "message": "User created successfully. Verification code will be sent shortly."
        }, status=status.HTTP_201_CREATED)
    
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
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)