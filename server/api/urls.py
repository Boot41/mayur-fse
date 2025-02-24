from django.urls import path
from . import views

urlpatterns = [
    # Presentation URLs
    path('create-ppt/', views.CreatePPTView.as_view(), name='create-ppt'),
    path('fetch-ppt/', views.UserPPTView.as_view(), name='fetch-ppt'),
    path('update-ppt/<int:id>/', views.UpdatePresentationView.as_view(), name='update-ppt'),
    path('delete-ppt/<int:id>/', views.DeletePresentationView.as_view(), name='delete-ppt'),

    # Project URLs
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:id>/', views.ProjectDetailView.as_view(), name='project-detail'),

    # Task URLs
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list'),  # For getting all tasks
    path('projects/<int:project_id>/tasks/', views.TaskListCreateView.as_view(), name='project-tasks'),
    path('tasks/<int:id>/', views.TaskDetailView.as_view(), name='task-detail'),
]