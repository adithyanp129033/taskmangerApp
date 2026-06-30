from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    """
    Custom user model to allow future extensions of user profiles.
    """
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


class Task(models.Model):
    """
    Task model representing user tasks.
    """
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
