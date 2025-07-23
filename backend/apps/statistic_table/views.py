from core.authentication.auth import JWTAuthentication
from core.pagination.user_pagination import UserPagination
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from apps.payment.models import PaymentLog, Payment
from apps.accounts.serializers import UserSerializer
from apps.payment.serializers import PaymentLogSerializer

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
        current_total_users = User.objects.exclude(role__name__in=['admin',]).count()
        current_data_collectors = User.objects.filter(role__name='dataCollector').count()
        current_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0

        # Last month counts
        last_total_users = User.objects.filter(
            created__gte=first_day_last_month,
            created__lt=first_day_current_month

        ).exclude(role__name__in=['admin']).count()

        last_data_collectors = User.objects.filter(
            role__name='dataCollector',
            created__gte=first_day_last_month,
            created__lt=first_day_current_month
        ).count()

        last_revenue = Payment.objects.filter(
            created__gte=first_day_last_month,
            created__lt=first_day_current_month
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


class UserTableView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        users = User.objects.all().exclude(role__name__in=['admin']).order_by('-id')
        role = request.query_params.get('roleName', None)
        status = request.query_params.get('status', None)
        term = request.query_params.get('term', None)


        match role:
            
            case 'subUser':
                users = users.filter(Q(role__name__icontains=role))
            case 'publicUser':
                users = users.filter(Q(role__name__icontains=role))
            case 'dataCollector':
                print("role", role)
                users = users.filter(Q(role__name__icontains=role))

        match status:
            case 'Paid':
                users = users.filter(Q(payment_status=status))
            case 'Pending':
                users = users.filter(Q(payment_status=status))
            case 'verified':
                users = users.filter(Q(email_verified=True) | Q(phone_verified=True))
            case 'unverified':
                users = users.filter(Q(email_verified=False) & Q(phone_verified=False))
            

        if term:
            try:
                # Try to filter by ID first
                term_id = int(term)
                users = users.filter(Q(pk=term_id))
            except ValueError:
                # If not an ID, try filtering by email or phone
                users = users.filter(Q(email__icontains=term) | Q(phone__icontains=term) | Q(first_name__icontains=term) | Q(last_name__icontains=term))

        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(result_page, many=True)
        formated_data = []

        for user in serializer.data:
            is_sub_user = user.get('roleName') == 'subUser'
            
            # Safely get child email and phone if subUser
            email = (
                user.get('child_contact', {}).get('email') 
                if is_sub_user 
                else user.get('email')
            ) or ""
            
            phone = (
                user.get('child_contact', {}).get('phone') 
                if is_sub_user 
                else user.get('phone')
            ) or ""

            formated_data.append({
                'id': user['id'],
                'name': f"{user['first_name']} {user['last_name']}",
                'email': email,
                'phone': phone,
                "phone_verified": user['phone_verified'],
                "email_verified": user['email_verified'],
                'roleName': user['roleName'],  # or user['role'] if needed
                'payment_status': user['payment_status'],
                'verified': user['email_verified'] or user['phone_verified'],
                'approved': user['approved'],
                'rejected': user['rejected'],
                'postponed': user['postponed'],
                'approved_by': user['approved_by'],
                "addBy": user['addBy'],
            })

        return paginator.get_paginated_response(formated_data)

class CollectorTableView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        collectors = User.objects.filter(role__name='dataCollector')
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(collectors, request)

        data = []
        for collector in result_page:
            total_registrations = User.objects.filter(addBy=collector).count()
            verified_status = collector.email_verified or collector.phone_verified
            
            data.append({
                'id': collector.id,
                'name': f"{collector.first_name} {collector.last_name}",
                'total_registration': total_registrations,
                'payment_status': collector.payment_status,
                'verified': verified_status,
                'contact': collector.phone if collector.phone else collector.email
            })
        return paginator.get_paginated_response(data)

class PendingApplicationTableView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user.role, "name", None) != 'admin':
            return Response(
                {"status": "error", "message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        pending_applications = User.objects.filter(
            (Q(email_verified=True) | Q(phone_verified=True)) &
            Q(payment_status='Paid') &
            Q(role__name='dataCollector')
        ).select_related('role')  # Optimize DB hit for role access

        data = []

        for app in pending_applications:
            # Get related payment info
            payment_info = Payment.objects.filter(user_id=app.id).order_by('-created').first()

            # Get user profile safely
            user_profile = getattr(app, 'userprofile', None)
            address = getattr(user_profile, 'address', None) if user_profile else None
            zilla = getattr(address, 'zilla', None) if address else None
            upazila = getattr(address, 'upazila', None) if address else None

            data.append({
                "id": app.id,
                "firstName": app.first_name,
                "lastName": app.last_name,
                "email": app.email,
                "phone": app.phone,
                "district": getattr(zilla, 'name_en', None),
                "upazila": getattr(upazila, 'name_en', None),
                "nidNumber": getattr(user_profile, 'nid', None),
                "appliedAt": app.created.strftime("%Y-%m-%d") if app.created else None,
                "status": "Approved" if app.approved else "Pending",
                "paymentStatus": app.payment_status,
                "paidAmount": getattr(payment_info, 'amount', 0),
                "paidAt": payment_info.created.strftime("%Y-%m-%d") if payment_info else None,
                "role": app.role.name,
                "approved": app.approved,
                "rejected": app.rejected,
            })

        return Response(data, status=status.HTTP_200_OK)



class PaymentLogTableView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        payment_logs = PaymentLog.objects.select_related('payment__user').all().order_by('-created_at')
        paginator = self.pagination_class()
        result_page = paginator.paginate_queryset(payment_logs, request)
        serializer = PaymentLogSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class FamilyRelationshipView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        collectors = User.objects.filter(role__name='dataCollector')
        data = []
        for collector in collectors:
            public_users = User.objects.filter(addBy=collector)
            collector_data = {
                "collector": UserSerializer(collector).data,
                "public_users": []
            }
            for public_user in public_users:
                sub_accounts = User.objects.filter(parent=public_user)
                public_user_data = {
                    "public_user": UserSerializer(public_user).data,
                    "sub_accounts": UserSerializer(sub_accounts, many=True).data
                }
                collector_data["public_users"].append(public_user_data)
            data.append(collector_data)
        return Response(data, status=status.HTTP_200_OK)

class CollectorAppStatisticView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = request.user.role.name
        if user_role != 'admin':
            return Response({"status": "error", "message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

            # Pending Review, Approved, Rejected statistics and role is dataCollector
        data_collectors = User.objects.filter(role__name='dataCollector')
        
            
        data = {
            "pending_review": data_collectors.filter(Q(approved=False) & Q(rejected=False) & Q(payment_status='Paid') &(Q(email_verified=True) | Q(phone_verified=True))).count(),
            "approved": data_collectors.filter(approved=True).count(),
            "rejected": data_collectors.filter(rejected=True).count(),
            
        }
        return Response(data, status=status.HTTP_200_OK)