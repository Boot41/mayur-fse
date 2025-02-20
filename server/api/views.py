from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer

# Signup API
@api_view(['POST'])
def signup_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'message': 'User created successfully', 'user': UserSerializer(user).data})

# Login API
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, email=email, password=password)
    if user:
        return Response({'message': 'Login successful', 'user': UserSerializer(user).data})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# Role Selection API
@api_view(['POST'])
def select_role_view(request):
    user = request.user
    job_role = request.data.get('job_role')

    if not job_role:
        return Response({'error': 'Job role is required'}, status=status.HTTP_400_BAD_REQUEST)

    user.job_role = job_role
    user.save()
    return Response({'message': 'Job role updated successfully', 'user': UserSerializer(user).data})

# Logout API
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})
