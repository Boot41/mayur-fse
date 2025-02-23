from django.shortcuts import render
from django.contrib.auth import get_user_model 

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer

User = get_user_model()  

# Signup View
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([username, email, password]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
        
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e: 
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Select Role View
class SelectRoleView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            job_role = request.data.get('job_role')
            specialization = request.data.get('specialization')

            if not job_role:
                return Response(
                    {'error': 'Job role is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

           
            if not hasattr(request.user, 'job_role') or not hasattr(request.user, 'specialization'):
                return Response(
                    {'error': 'User model does not have job_role or specialization'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            request.user.job_role = job_role
            request.user.specialization = specialization
            request.user.save()
            
            return Response({
                'message': 'Profile updated successfully',
                'user': UserSerializer(request.user).data
            })
        except Exception as e:
            print(f"Error in select_role_view: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Logout View
class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')  
            if not refresh_token:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
