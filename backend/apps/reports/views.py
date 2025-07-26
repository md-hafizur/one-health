from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ReportDepartment
from .serializers import ParentDepartmentSerializer # Or ReportDepartmentSerializer

class DepartmentListView(APIView):
    def get(self, request, *args, **kwargs):
        # Fetch only top-level departments (those with no parent)
        # To optimize queries for deep nesting, you might need to use Prefetch objects
        # or accept N+1 queries for very deep, unpredictable hierarchies.
        # For a few levels, you can chain prefetch_related:
        departments = ReportDepartment.objects.filter(parent__isnull=True).prefetch_related(
            'reports',
            'children__reports',
            'children__children__reports', # Add more levels as needed for common depth
            # 'children__children__children__reports', etc.
        )
        # Alternatively, for very deep or unknown depths, you might accept N+1 or
        # use a custom manager method to fetch everything in fewer queries.

        serializer = ParentDepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)