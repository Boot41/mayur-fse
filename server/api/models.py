from django.db import models
from authentication.models import User
from django.utils import timezone

class Presentation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presentations')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    data = models.JSONField()  # This will store the JSON format for the presentation
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Project(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='project', null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
