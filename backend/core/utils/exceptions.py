from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework.exceptions import APIException
from rest_framework.utils.serializer_helpers import ReturnDict


class Unauthorized(APIException):
    status_code = 403
    default_detail = "You are not allowed to use this profile"
    default_code = "forbidden"

    def __init__(self, detail=None, code=None):
        if isinstance(detail, dict):
            # Make sure the detail is serialized as a dict properly
            self.detail = ReturnDict(detail, serializer=None)
        else:
            self.detail = {"message": detail or self.default_detail}
        if code:
            self.detail["code"] = code
        else:
            self.detail["code"] = self.default_code


def custom_exception_handler(exc, context):
    from rest_framework.views import exception_handler

    # Call the default exception handler first, to get the standard error response.
    response = exception_handler(exc, context)

    if response is None:
        # Handle exceptions that are not caught by DRF's default exception handler
        if isinstance(exc, Http404):
            response = Response (
                "Not found",
                status=status.HTTP_404_NOT_FOUND
            )
        elif isinstance(exc, Unauthorized):
            response = Response(
                "Unauthorized access",
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie("access-token")
            response.delete_cookie("refresh-token")
        elif isinstance(exc, PermissionDenied):
            response = Response(
                "Permission denied", status=status.HTTP_403_FORBIDDEN
            )
        elif isinstance(exc, APIException):
            response = Response(exc.detail, status=exc.status_code)
        else:
            response = Response(
                "Internal server error",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
    return response
