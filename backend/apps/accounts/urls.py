from django.urls import path, include
from . import views

urlpatterns = [
    path('register', views.RegisterUserView.as_view(), name='register'),
    path('verify-otp', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('send-otp', views.SendVerificationView.as_view(), name='send-otp'),

    # user
    path('user-details', views.UserDetailView.as_view(), name='user'),
]