from django.urls import path, include
from . import views

urlpatterns = [
    path('system-statistics', views.systemStatistic.as_view(), name='system-statistics'),
    path('user-table', views.UserTableView.as_view(), name='user-table-view'),
    path('collector-table', views.CollectorTableView.as_view(), name='collector-table-view'),
    path('pending-application-table', views.PendingApplicationTableView.as_view(), name='pending-application-table-view'),
    path('payment-log-table', views.PaymentLogTableView.as_view(), name='payment-log-table-view'),
    path('family-relationship', views.FamilyRelationshipView.as_view(), name='family-relationship-view'),
    path('collector-app-statistic', views.CollectorAppStatisticView.as_view(), name='data-collector-app-statistic-view'),
]