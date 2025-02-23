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