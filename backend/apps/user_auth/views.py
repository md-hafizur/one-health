from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from apps.accounts.models import User
from apps.user_auth.models import Session

from .serializers import LoginSerializer, ApprovedRejectedUserSerializer, UpdateUserSerializer,PasswordSerializer
from ..accounts.serializers import UserSerializer,PublicUserSerializer
from rest_framework.permissions import IsAuthenticated
from core.authentication.auth import JWTAuthentication


class login(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data.get("phone") or serializer.validated_data.get("email")
            account_type = serializer.validated_data.get("account_type")

            match account_type:
                case "public":
                    user = User.objects.filter(
                        Q(phone=contact) | Q(email=contact)&
                        Q(role__name="public")
                    ).first()

                    if user is None:
                        user = User.objects.filter(
                        Q(parent__phone=contact) | Q(parent__email=contact)&
                        Q(role__name="subUser")&
                        Q(password=serializer.validated_data["password"])
                    ).first()
                    # print("user222((((((((((()))))))))))", user)
                    
                case "dataCollector":
                    user = User.objects.filter(
                        Q(phone=contact) | Q(email=contact)&
                        Q(role__name="dataCollector")
                    ).first()
                case "admin":
                    user = User.objects.filter(
                        Q(phone=contact) | Q(email=contact)&
                        Q(role__name="admin")
                    ).first()

            contact_type = "phone" if serializer.validated_data.get("phone") else "email"
            
            if not user:
                return Response(
                    {"errors": {"user": ["User not found"]}},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not user.check_password(serializer.validated_data["password"]):
                return Response(
                    {"errors": {"password": ["Invalid credentials"]}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            
            verification_map = {
                "phone": "phone_verified",
                "email": "email_verified",
            }
            
            if not getattr(user, verification_map[contact_type]):
                return Response(
                    {"errors": {contact_type: [f"{contact_type.capitalize()} not verified"]}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            visitor_id = request.COOKIES.get("X-Visitor-ID") or request.headers.get(
                "X-Visitor-ID"
            )
            if not visitor_id:
                return Response(
                    {"errors": {"X-Visitor-ID": ["Visitor ID is required."]}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            session = Session.objects.filter(user=user, visitor_id=visitor_id).first()

            if session:
                session.remember = serializer.validated_data.get("remember", False)
                session.user_agent = request.META.get("HTTP_USER_AGENT")
                session.ip = request.META.get("REMOTE_ADDR")
                session.update_access_token() # This will also update refresh_token and their expiry
                session.save()
            else:
                session = Session.objects.create(
                    user=user,
                    visitor_id=visitor_id,
                    remember=serializer.validated_data.get("remember", False),
                    user_agent=request.META.get("HTTP_USER_AGENT"),
                    ip=request.META.get("REMOTE_ADDR")
                )
            response =  Response(
                UserSerializer(user, context={"request": request}).data
            )
            response.set_cookie(
                "access-token",
                session.access_token,
                path="/",
                max_age=5 * 60,
                httponly=True,
                samesite="None",
                secure=True,
            )
            response.set_cookie(
                "refresh-token",
                session.refresh_token,
                path="/",
                max_age=60 * 68 * 24,
                httponly=True,
                samesite="None",
                secure=True,
            )
            return response
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class verify(APIView):
    def get(self, request):
        access_token = request.COOKIES.get("access-token") or request.headers.get(
            "access-token"
        )
        refresh_token = request.COOKIES.get("refresh-token") or request.headers.get(
            "refresh-token"
        )
        visitor_id = request.COOKIES.get("X-Visitor-ID") or request.headers.get(
            "X-Visitor-ID"
        )
    
        if not refresh_token:
            response = Response(
                {"error": "Credentials not provide"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie("access-token")
            response.delete_cookie("refresh-token")
            return response

        if access_token:
            session = Session.objects.filter(
                access_token=access_token, visitor_id=visitor_id
            ).first()
            if not session:
                session = Session.objects.filter(
                    refresh_token=refresh_token,
                    visitor_id=visitor_id,
                    refresh_token_expires__gt=timezone.now(),
                ).first()
                if not session:
                    response = Response(
                        {"error": "Invalid token"},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
                    response.delete_cookie("access-token")
                    response.delete_cookie("refresh-token")
                    return response
                session.update_access_token()
                getUser = User.objects.get(id=session.user.id)
                response = Response(
                    {
                        "message": "Token verified",
                        "data": UserSerializer(getUser, context={"request": request}).data,
                    },
                    status=status.HTTP_200_OK,
                )
                response.set_cookie(
                    "access-token",
                    session.access_token,
                    path="/",
                    max_age=5,
                    httponly=True,
                    samesite="None",
                    secure=False,
                )
                return response
            if (
                session.access_token_expires < timezone.now()
                and session.refresh_token_expires > timezone.now()
            ):
                session.update_access_token()
                getUser = User.objects.get(id=session.user.id)
                response = Response(
                    {
                        "message": "Token verified",
                        "data": UserSerializer(getUser, context={"request": request}).data,
                    },
                    status=status.HTTP_200_OK,
                )
                response.set_cookie(
                    "access-token",
                    session.access_token,
                    path="/",
                    max_age=5 ,
                    httponly=True,
                    samesite="None",
                    secure=False,
                )
                return response

        session = Session.objects.filter(
            refresh_token=refresh_token,
            visitor_id=visitor_id,
            refresh_token_expires__gt=timezone.now(),
        ).first()
        if not session:
            response = Response(
                {"error": "Invalid token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie("refresh-token")
            return response
        session.update_access_token()
        getUser = User.objects.get(id=session.user.id)
        response = Response(
            {
                "message": "Token verified",
                "data": UserSerializer(getUser, context={"request": request}).data,
            }
        )
        response.set_cookie(
            "access-token",
            session.access_token,
            path="/",
            max_age=5,
            httponly=True,
            samesite="None",
            secure=False,
        )
        return response


class logout(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):

        print("request.user.is_authenticated",request.user.is_authenticated)
        if not request.user.is_authenticated:
            return Response(
                {"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
            )
        session = request.session
        session.refresh_token_expires = timezone.now()
        session.access_token_expires = timezone.now()
        session.save()
        response = Response(
            {"message": "Logout successful"}, status=status.HTTP_200_OK
        )
        response.delete_cookie("access-token")
        response.delete_cookie("refresh-token")
        response.delete_cookie("X-Visitor-ID")
        return response

class UserDetail(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = PublicUserSerializer(user, context={"request": request})
        # formated_data = []

        # for user in serializer.data:
        #     is_sub_user = user.get('roleName') == 'subUser'
            
        #     # Safely get child email and phone if subUser
        #     email = (
        #         user.get('child_contact', {}).get('email') 
        #         if is_sub_user 
        #         else user.get('email')
        #     ) or ""
            
        #     phone = (
        #         user.get('child_contact', {}).get('phone') 
        #         if is_sub_user 
        #         else user.get('phone')
        #     ) or ""

        #     formated_data.append({
        #         'id': user['id'],
        #         'name': f"{user['first_name']} {user['last_name']}",
        #         'email': email,
        #         'phone': phone,
        #         "phone_verified": user['phone_verified'],
        #         "email_verified": user['email_verified'],
        #         'roleName': user['roleName'],  # or user['role'] if needed
        #         'payment_status': user['payment_status'],
        #         'verified': user['email_verified'] or user['phone_verified'],
        #         'approved': user['approved'],
        #         'rejected': user['rejected'],
        #         'postponed': user['postponed'],
        #         'approved_by': user['approved_by'],
        #         "initiator": user['initiator'],
        #     })
        
        return Response(serializer.data)

class ApprovedUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_role = getattr(request.user.role, 'name', None)
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        approved = request.data.get('approved')
        rejected = request.data.get('rejected')
        user_id = request.data.get('id')
        contact = request.data.get('contact')

        if not user_id:
            return Response({"status": "error", "message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_update = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"status": "warning", "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_to_update.role.name != 'dataCollector':
            return Response({"status": "warning", "message": "User is not a data collector"}, status=status.HTTP_400_BAD_REQUEST)

        if approved is True:
            user_to_update.approved = True
            user_to_update.rejected = False
            user_to_update.approved_by = request.user
            user_to_update.approved_at = timezone.now()
            user_to_update.save(update_fields=['approved','rejected', 'approved_by', 'approved_at'])
            return Response({"status": "success", "message": f"User {user_to_update.first_name} approved"}, status=status.HTTP_200_OK)

        elif rejected is True:
            if not contact:
                return Response({"status": "error", "message": "Contact is required to reject user"}, status=status.HTTP_400_BAD_REQUEST)
            
            if user_to_update.email != contact and user_to_update.phone != contact:
                return Response({"status": "error", "message": "Contact does not match with user"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Reject logic here
            user_to_update.rejected = True
            user_to_update.approved = False
            user_to_update.rejected_by = request.user
            user_to_update.rejected_at = timezone.now()
            user_to_update.save(update_fields=['rejected', 'approved', 'rejected_by', 'rejected_at'])
            return Response({
                "status": "success",
                "message": f"User {user_to_update.first_name} rejected successfully"
            }, status=status.HTTP_200_OK)

        else:
            return Response({"status": "error", "message": "Invalid action. Provide either approved=True or rejected=True"}, status=status.HTTP_400_BAD_REQUEST)


class DeleteUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_role = getattr(request.user.role, 'name', None)
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        identity = request.data.get('identity')
        user_id = request.data.get('id')
        contact = request.data.get('contact')

        if not contact:
            return Response({"status": "error", "message": "Contact is required to delete user"}, status=status.HTTP_400_BAD_REQUEST)

        if not user_id:
            return Response({"status": "error", "message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        

        if identity == 'subUser':
            if not contact:
                return Response({"status": "error", "message": "Parent contact is required"}, status=status.HTTP_400_BAD_REQUEST)

            filters = Q(id=user_id) & (Q(parent__email=contact) | Q(parent__phone=contact))
        else:
            filters = Q(id=user_id) & (Q(email=contact) | Q(phone=contact))

        user_to_delete = User.objects.filter(filters).only('id', 'first_name').first()

        if not user_to_delete:
            return Response({"status": "warning", "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user_to_delete.delete()
        return Response({"status": "success", "message": f"User {user_to_delete.first_name} deleted"}, status=status.HTTP_200_OK)

class PostponedReinstateUser(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_role = getattr(request.user.role, 'name', None)
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        identity = request.data.get('identity')
        user_id = request.data.get('id')
        contact = request.data.get('contact')

        if not contact:
            return Response({"status": "error", "message": "Contact is required to delete user"}, status=status.HTTP_400_BAD_REQUEST)

        if not user_id:
            return Response({"status": "error", "message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        

        if identity == 'subUser':
            if not contact:
                return Response({"status": "error", "message": "Parent contact is required"}, status=status.HTTP_400_BAD_REQUEST)

            filters = (
                Q(id=user_id) &
                (Q(parent__email=contact) | Q(parent__phone=contact)) 
            )
        else:
            filters = (
                Q(id=user_id) &
                (Q(email=contact) | Q(phone=contact))
            )

        user_to_update = User.objects.filter(filters).only('id', 'first_name').first()

        if not user_to_update:
            return Response({"status": "warning", "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        elif user_to_update.rejected:
            return Response({"status": "warning", "message": "Cannot postpone a rejected user"}, status=status.HTTP_400_BAD_REQUEST)
        elif user_to_update.approved is False:
            return Response({"status": "warning", "message": "Cannot postpone an unapproved user"}, status=status.HTTP_400_BAD_REQUEST)
        elif user_to_update.email_verified is False and user_to_update.phone_verified is False:
            return Response({"status": "warning", "message": "Cannot postpone a user with unverified contact"}, status=status.HTTP_400_BAD_REQUEST)

        elif user_to_update.payment_status != 'Paid':
            return Response({"status": "warning", "message": "Cannot postpone a user with unpaid payment"}, status=status.HTTP_400_BAD_REQUEST)

        match user_to_update.postponed:
            case True:
                user_to_update.postponed = False
            case False:
                user_to_update.postponed = True

        user_to_update.save(update_fields=['postponed'])

        return Response({"status": "success", "message": f"User {user_to_update.first_name} " + ("postponed" if user_to_update.postponed else "reinstated")}, status=status.HTTP_200_OK)

class UserApproveReject(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_role = getattr(request.user.role, 'name', None)
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializers_data = ApprovedRejectedUserSerializer(data=request.data)
        if not serializers_data.is_valid():
            return Response({"status": "error", "message": serializers_data.errors}, status=status.HTTP_400_BAD_REQUEST)

        if serializers_data.validated_data.get("identity") != 'subUser':
            user = User.objects.filter(
                Q(id=serializers_data.validated_data.get('user_id')) & 
                (Q(email=serializers_data.validated_data.get('contact')) | Q(phone=serializers_data.validated_data.get('contact')))
            ).first()
        else:
            user = User.objects.filter(
                Q(id=serializers_data.validated_data.get('user_id')) & 
                (Q(parent__email=serializers_data.validated_data.get('contact')) | Q(parent__phone=serializers_data.validated_data.get('contact')))
            ).first()

        if not user:
            return Response({"status": "warning", "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)


        if serializers_data.validated_data.get('approved') is True:
            user.approved = True
            user.rejected = False
            user.approved_by = request.user
            user.approved_at = timezone.now()
            user.save(update_fields=['approved','rejected', 'approved_by', 'approved_at'])
            return Response({"status": "success", "message": f"User {user.first_name} approved"}, status=status.HTTP_200_OK)

        elif serializers_data.validated_data.get('rejected') is True:
            user.rejected = True
            user.approved = False
            user.rejected_by = request.user
            user.rejected_at = timezone.now()
            user.save(update_fields=['approved','rejected', 'approved_by', 'approved_at', 'rejected_by', 'rejected_at'])
            return Response({"status": "success", "message": f"User {user.first_name} rejected"}, status=status.HTTP_200_OK)


        return Response({"status": "warning", "message": "Not implemented yet"}, status=status.HTTP_400_BAD_REQUEST)


class UpdateUsers(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def put(self, request):
        user = request.user  # Authenticated user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Response({"status": "error", "message": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateUserSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({"status": "error", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data

        try:
            # Update user
            user.first_name = validated.get('first_name', user.first_name)
            user.last_name = validated.get('last_name', user.last_name)
            user.save(update_fields=['first_name', 'last_name'])

            # Update profile
            profile.name_bn = validated.get('name_bn', profile.name_bn)
            profile.name_en = f"{user.first_name} {user.last_name}"
            profile.save(update_fields=['name_bn', 'name_en'])

        except Exception as e:
            transaction.set_rollback(True)
            return Response({"status": "error", "message": f"Update failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "success", "message": "User updated successfully"}, status=status.HTTP_200_OK)


class UpdateUserPassword(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = PasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({"status": "error", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        user = User.objects.filter(id=user.id, password=validated['current_password']).first()
        if not user:
            return Response({"status": "error", "message": "Invalid current password"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user.set_password(validated['new_password'])
            user.save(update_fields=['password'])

        except Exception as e:
            return Response({"status": "error", "message": f"Update failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "success", "message": "User updated successfully"}, status=status.HTTP_200_OK)
