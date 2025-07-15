from django.urls import path
from . import views

urlpatterns = [
    # List & Create
    path('divisions/', views.DivisionListCreateView.as_view()),
    path('zillas/', views.ZillaListCreateView.as_view()),
    path('upazilas/', views.UpazilaListCreateView.as_view()),
    path('unions/', views.UnionListCreateView.as_view()),
    path('villages/', views.VillageListCreateView.as_view()),
    path('paras/', views.ParaListCreateView.as_view()),
    path('postoffices/', views.PostOfficeListCreateView.as_view()),

    # Retrieve, Update, Delete
    path('divisions/<int:pk>/', views.DivisionDetailView.as_view()),
    path('zillas/<int:pk>/', views.ZillaDetailView.as_view()),
    path('upazilas/<int:pk>/', views.UpazilaDetailView.as_view()),
    path('unions/<int:pk>/', views.UnionDetailView.as_view()),
    path('villages/<int:pk>/', views.VillageDetailView.as_view()),
    path('paras/<int:pk>/', views.ParaDetailView.as_view()),
    path('postoffices/<int:pk>/', views.PostOfficeDetailView.as_view()),
]
