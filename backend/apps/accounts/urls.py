from django.urls import path, include
from . import views

urlpatterns = [
    path('register', views.RegisterUserView.as_view(), name='register'),
    path('verify-otp', views.VerifyOTPView.as_view(), name='verify-otp'),
]