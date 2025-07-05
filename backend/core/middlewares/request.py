from restapi.response import DictResponse


class ApiRequestMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        visitor_id = request.COOKIES.get("access-token") or request.headers.get(
            "access-token"
        )
        if not visitor_id:
            response = DictResponse("Bad request", status=400)
            return response
        response = self.get_response(request)
        return response
