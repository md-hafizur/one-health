# paginations.py
from rest_framework.pagination import PageNumberPagination

class UserPagination(PageNumberPagination):
    page_size = 5  # Initial page size
    page_size_query_param = 'page_size'  # Allow clients to override
    max_page_size = 100
