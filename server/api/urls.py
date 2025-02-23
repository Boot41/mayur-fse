from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from . import views

urlpatterns = [
    path('home/', views.HomeView.as_view(), name='home'),
    path('create-ppt/', views.CreatePPTView.as_view(), name='create-ppt'),
    path('fetch-ppt/', views.UserPPTView.as_view(), name='fetch-ppt'),
    path('update-ppt/<int:id>/', views.UpdatePresentationView.as_view(), name='update-ppt'),
    path('delete-ppt/<int:id>/', views.DeletePresentationView.as_view(), name='delete-ppt'),
]