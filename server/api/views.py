from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from dotenv import load_dotenv

from authentication.models import User
from .helpers import extract_json_from_response
from .models import Presentation
from .serializers import PresentationSerializer


import os
import json
import logging
import groq


load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
client = groq.Client(api_key=GROQ_API_KEY)
logger = logging.getLogger('groq_ppt')


class HomeView(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        content = {'message': 'Welcome to the JWT Authentication page using React and Django'}
        return Response(content)


class CreatePPTView(APIView):
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

            # template = f"""
            # I'm an {job_role} with a {specialization} specialization who is going to give you some data/content on an idea that I have.
            # Your job is to generate sensible content pertaining to the idea and generate slides for it. 
            # Give approximately 10-12 slides with each slide having around 3-5 bullet points. 
            # The slides should be in the order they should be presented. 
            # Also highlight talking points that seem important to the user.
            # GIVE THE RESPONSE IN THE FORMAT OF A JSON OBJECT. The JSON object should be formatted as follows:
            # {{  
            #     "title": "Presentation Title",
            #     "slides": [
            #         {{
            #             "title": "Slide 1 Title",
            #             "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3", ...]
            #         }},
            #         ...
            #     ],
            #     "talking_points": ["Talking point 1", "Talking point 2", ...]
            # }}

            # Generate content based on this: 
            # {prompt}
            # """

            # chat_completion = client.chat.completions.create(
            #     messages=[
            #         {
            #             "role": "user",
            #             "content": template
            #         }
            #     ],
            #     model="llama3-8b-8192",
            # )

            # response = chat_completion.choices[0].message.content

            # logger.info("Received response from API")



            try:
                # First try to parse the response directly as JSON
                # try:
                #     parsed_response = json.loads(response)
                # except json.JSONDecodeError:
                #     # If direct parsing fails, try to extract JSON from markdown
                #     parsed_response = extract_json_from_response(response)

                parsed_response = {
                    "title": "Sample Presentation",
                    "slides": [
                        {"title": "Introduction", "content": ["Overview of the topic", "Why it's important"]},
                        {"title": "Main Concept", "content": ["Key principles", "Use cases"]},
                        {"title": "Conclusion", "content": ["Summary", "Next steps"]},
                    ],
                    "talking_points": ["Focus on key takeaways", "Provide real-world examples"]
                }

                presentation = Presentation.objects.create(
                    user=request.user,
                    title=parsed_response.get("title", "Untitled Presentation"),
                    description=prompt,
                    data=parsed_response
                )

                logger.info("Created presentation")

                return JsonResponse(
                    {
                        "message": "Presentation created successfully",
                        "presentation_id": presentation.id,
                        "title": presentation.title
                    },
                    status=201
                )
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Invalid JSON in API response: {response}")
                return JsonResponse({"error": f"Invalid JSON in API response: {str(e)}"}, status=500)

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            logger.exception("An error occurred while processing the request")
            return JsonResponse({"error": str(e)}, status=500)


class UserPPTView(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        user = request.user
        presentations = Presentation.objects.filter(user=user)
        serializer = PresentationSerializer(presentations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdatePresentationView(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, id):
        presentation = get_object_or_404(Presentation, id=id)
        if presentation.user != request.user:
            return Response({"error": "You do not have permission to update this presentation"}, status=status.HTTP_403_FORBIDDEN)
        serializer = PresentationSerializer(presentation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeletePresentationView(APIView):
    permission_classes = (IsAuthenticated, )

    def delete(self, request, id):
        presentation = get_object_or_404(Presentation, id=id)

        if presentation.user != request.user:
            return Response(
                {"error": "You do not have permission to delete this presentation"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            presentation.delete()
            return Response({"message": "Presentation deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)