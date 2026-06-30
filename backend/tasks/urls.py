from django.urls import path
from .views import register_user, task_list_create, task_detail_update_delete

urlpatterns = [
    path('auth/register/', register_user, name='register'),
    path('tasks/', task_list_create, name='task-list'),
    path('tasks/<int:pk>/', task_detail_update_delete, name='task-detail'),
]
