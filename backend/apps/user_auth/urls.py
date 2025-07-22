from django.urls import path, include
from . import views

urlpatterns = [
    path('login', views.login.as_view(), name='login'),
    path('logout', views.logout.as_view(), name='logout'),
    path('verify', views.verify.as_view(), name='verify'),
    path('user', views.UserDetail.as_view(), name='user'),
    path('approve-reject',views.ApprovedUser.as_view(), name='approve-reject')
]
