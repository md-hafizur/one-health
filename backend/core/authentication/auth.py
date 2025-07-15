from rest_framework.authentication import BaseAuthentication
from apps.user_auth.models import Session
from django.contrib.auth.models import AnonymousUser

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token =  request.headers.get("Access-Token") or request.COOKIES.get("access-token")
        refresh_token =  request.headers.get("Refresh-Token") or request.COOKIES.get("refresh-token")
        print("access_token",access_token,"refresh_token",refresh_token)
        # if not access_token and not refresh_token:
        #     return AnonymousUser(), None

        if access_token:
            session = Session.objects.filter(access_token=access_token).first()
            if session:
                return (session.user, None)

        if refresh_token:
            session = Session.objects.filter(refresh_token=refresh_token).first()
            if session:
                session.update_access_token()
                return (session.user, None)

        return None