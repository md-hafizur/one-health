from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from apps.accounts.models import User
from apps.user_auth.models import Session

from .serializers import LoginSerializer
from ..accounts.serializers import UserSerializer


class login(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data.get("phone") or serializer.validated_data.get("email")
            user = User.objects.filter(
                Q(phone=contact) | Q(email=contact)
            ).first()
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
            visitor_id = request.COOKIES.get("visitorId") or request.headers.get(
                "visitorId"
            )
            if not visitor_id:
                return Response(
                    {"errors": {"visitorId": ["Visitor ID is required."]}},
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
                httponly=False,
                samesite="None",
                secure=True,
            )
            response.set_cookie(
                "refresh-token",
                session.refresh_token,
                path="/",
                max_age=60 * 68 * 24,
                httponly=False,
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
        visitor_id = request.COOKIES.get("visitorId") or request.headers.get(
            "visitorId"
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
                    httponly=False,
                    samesite="None",
                    secure=True,
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
                    httponly=False,
                    samesite="None",
                    secure=True,
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
            httponly=False,
            samesite="None",
            secure=True,
        )
        return response


class logout(APIView):
    def get(self, request):

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
        return response
