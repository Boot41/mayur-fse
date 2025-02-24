from rest_framework import serializers
from .models import Presentation, Project, Task

class PresentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentation
        fields = ['id', 'user', 'title', 'description', 'data', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'project', 'due_date']
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        user = self.context['request'].user
        return Task.objects.create(user=user, **validated_data)
