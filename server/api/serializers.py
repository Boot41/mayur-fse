from rest_framework import serializers
from .models import Presentation

class PresentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentation
        fields = ['id', 'user', 'title', 'description', 'data', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
