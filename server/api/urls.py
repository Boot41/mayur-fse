from django.urls import path
from .views import signup_view, login_view, select_role_view, logout_view

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('select-role/', select_role_view, name='select_role'),

]
