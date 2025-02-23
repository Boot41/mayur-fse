from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User
from django.http import JsonResponse

from dotenv import load_dotenv

from .models import User
from .serializers import UserSerializer
from .helpers import extract_json_from_response

import os
import json
import logging
import groq


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


class HomeView(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        content = {'message': 'Welcome to the JWT Authentication page using React and Django'}
        return Response(content)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
client = groq.Client(api_key=GROQ_API_KEY)

logger = logging.getLogger('groq_ppt')

class GROQView(APIView):
    permission_classes = (IsAuthenticated, )
    def post(self, request):
        try:
            data = json.loads(request.body)
            prompt = data.get("prompt")
            if not prompt: 
                return JsonResponse({"error": "Prompt is required"}, status=400)
            
            job_role = request.user.job_role
            specialization = request.user.specialization

            logger.info(f"Received prompt: {prompt}")

            template = f"""
            I'm an {job_role} with a {specialization} specialization who is going to give you some data/content on an idea that I have.
            Your job is to generate sensible content pertaining to the idea and generate slides for it. 
            Give approximately 10-12 slides with each slide having around 3-5 bullet points. 
            The slides should be in the order they should be presented. 
            Also highlight talking points that seem important to the user.
            GIVE THE RESPONSE IN THE FORMAT OF A JSON OBJECT. The JSON object should be formatted as follows:
            {{
                "slides": [
                    {{
                        "title": "Slide 1 Title",
                        "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3", ...]
                    }},
                    ...
                ],
                "talking_points": ["Talking point 1", "Talking point 2", ...]
            }}

            Generate content based on this: 
            {prompt}
            """

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": template
                    }
                ],
                model="llama3-8b-8192",
            )

            response = chat_completion.choices[0].message.content

            logger.info("Received response from API")

            try:
                # First try to parse the response directly as JSON
                try:
                    parsed_response = json.loads(response)
                except json.JSONDecodeError:
                    # If direct parsing fails, try to extract JSON from markdown
                    parsed_response = extract_json_from_response(response)
                
                return JsonResponse({"response": parsed_response})
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Invalid JSON in API response: {response}")
                return JsonResponse({"error": f"Invalid JSON in API response: {str(e)}"}, status=500)

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            logger.exception("An error occurred while processing the request")
            return JsonResponse({"error": str(e)}, status=500)

            