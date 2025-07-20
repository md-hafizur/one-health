from django.urls import path, include
from . import views

urlpatterns = [
    path('system-statistics', views.systemStatistic.as_view(), name='system-statistics'),
]