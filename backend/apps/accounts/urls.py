from django.urls import path, include
from . import views

urlpatterns = [
    path('register', views.RegisterUserView.as_view(), name='register'),
    path('verify-otp', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('send-otp', views.SendVerificationView.as_view(), name='send-otp'),

    # user
    path('user-details', views.UserDetailView.as_view(), name='user'),
    path('last-user-details', views.UserLastDetail.as_view(), name='last-user'),
    path("user-statistics", views.UserStatisticsView.as_view(), name="user-statistics"),
    path("public-user", views.publicUserView.as_view(), name="public-user"),
]