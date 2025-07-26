from django.urls import path, include
from . import views

urlpatterns = [
    path('departments', views.DepartmentListView.as_view(), name='report-departments'),
]