from apps.user_auth.models import Session
from core.utils.exceptions import Unauthorized
from django.contrib.auth.models import AnonymousUser

# import annonymasuser


class JwtTokenMiddleware(object):
    excluded_urls = ["/auth/login", "/admin"]

    def __init__(self, get_response):
        self.get_response = get_response

    def process_request(self, request):

        if self._is_excluded_url(request.path):
            return request

        access_token = request.COOKIES.get("access-token") or request.headers.get(
            "Access-Token"
        )
        refresh_token = request.COOKIES.get("refresh-token") or request.headers.get(
            "Refresh-Token"
        )
        visitor_id = request.COOKIES.get("visitorId") or request.headers.get(
            "visitorId"
        )

        if access_token:
            session = Session.objects.filter(access_token=access_token).first()
            if not session:
                if refresh_token:
                    session = Session.objects.filter(
                        refresh_token=refresh_token
                    ).first()
                    if not session:
                        return self._set_invalid_session_response(request)
                    session.update_access_token()
                    self.access_token = session.access_token
                    self.access_token_expires = session.access_token_expires
                    request.session = session
                    request.user = session.user
                else:
                    return self._set_invalid_session_response(request)
            else:
                request.session = session
                request.user = session.user

        elif refresh_token:
            session = Session.objects.filter(
                refresh_token=refresh_token,
                visitor_id=visitor_id,
            ).first()
            if not session:
                return self._set_invalid_session_response(request)
            session.update_access_token()
            self.access_token = session.access_token
            self.access_token_expires = session.access_token_expires
            request.session = session
            request.user = session.user
        else:
            request.session = None
            request.user = AnonymousUser()

        return request

    def __call__(self, request):
        request = self.process_request(request)
        response = self.get_response(request)
        return response

    def _is_excluded_url(self, path):
        """Check if the current path should be excluded from verification."""
        return any(path.startswith(url) for url in self.excluded_urls)

    def _set_invalid_session_response(self, request):
        """Redirect to sign-in when the session is invalid."""
        raise Unauthorized({"message": "Invalid session."})

    def _set_session_expired_response(self, request):
        """Redirect to sign-in when the session is expired."""
        raise Unauthorized({"message": "Session expired."})

    def _set_invalid_api_token_response(self, request):
        """Redirect to sign-in when the API token is invalid."""
        raise Unauthorized({"message": "Invalid API token."})

    def _set_permission_denied_response(self, request):
        """Redirect to sign-in when permission is denied."""
        raise Unauthorized({"message": "Permission denied."})
