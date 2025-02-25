from django.contrib import admin
from .models import Presentation, Task, Project

# Register your models here.
admin.site.register(Presentation)
admin.site.register(Task)
admin.site.register(Project)
