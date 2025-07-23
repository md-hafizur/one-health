from django.urls import path, include
from . import views

urlpatterns = [
    path('login', views.login.as_view(), name='login'),
    path('logout', views.logout.as_view(), name='logout'),
    path('verify', views.verify.as_view(), name='verify'),
    path('user', views.UserDetail.as_view(), name='user'),
    path('approve-reject',views.ApprovedUser.as_view(), name='approve-reject'),
    path('postponed-reinstate', views.PostponedReinstateUser.as_view(), name='postponed-reinstate'),
    path('delete-user', views.DeleteUser.as_view(), name='delete-user'),
    path('users-approve-reject', views.UserApproveReject.as_view(), name='users-approve-reject'),
]
