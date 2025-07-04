from django.urls import path, include
from . import views

urlpatterns = [
    path('register', views.RegisterUserView.as_view(), name='register'),
]