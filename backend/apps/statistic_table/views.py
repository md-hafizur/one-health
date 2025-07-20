from core.authentication.auth import JWTAuthentication
from core.pagination.user_pagination import UserPagination
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from apps.payment.models import Payment
from apps.accounts.serializers import UserSerializer

from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from django.db.models import Q
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class systemStatistic(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        today = now().date()
        first_day_current_month = today.replace(day=1)
        first_day_last_month = first_day_current_month - relativedelta(months=1)

        # Current counts
        current_total_users = User.objects.exclude(role__name__in=['admin', 'dataCollector']).count()
        current_data_collectors = User.objects.filter(role__name='dataCollector').count()
        current_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0

        # Last month counts
        last_total_users = User.objects.filter(
            date_joined__gte=first_day_last_month,
            date_joined__lt=first_day_current_month
        ).exclude(role__name__in=['admin', 'dataCollector']).count()

        last_data_collectors = User.objects.filter(
            role__name='dataCollector',
            date_joined__gte=first_day_last_month,
            date_joined__lt=first_day_current_month
        ).count()

        last_revenue = Payment.objects.filter(
            created_at__gte=first_day_last_month,
            created_at__lt=first_day_current_month
        ).aggregate(total=Sum('amount'))['total'] or 0

        def format_percent(current, last):
            if last == 0 and current == 0:
                return "0%"
            elif last == 0:
                return f"+{current}%"
            diff = ((current - last) / last) * 100
            sign = "+" if diff >= 0 else ""
            return f"{sign}{round(diff)}%"

        stats = [
            {
                "title": "Total Users",
                "value": f"{current_total_users:,}",
                "change": format_percent(current_total_users, last_total_users),
            },
            {
                "title": "Data Collectors",
                "value": f"{current_data_collectors:,}",
                "change": format_percent(current_data_collectors, last_data_collectors),
            },
            {
                "title": "Total Revenue",
                "value": f"৳{current_revenue:,.0f}",
                "change": format_percent(current_revenue, last_revenue),
            },
        ]

        return Response({"data": stats}, status=status.HTTP_200_OK)


