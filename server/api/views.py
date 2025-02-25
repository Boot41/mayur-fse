from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.conf import settings

from dotenv import load_dotenv

from authentication.models import User
from .helpers import extract_json_from_response
from .models import Presentation, Project, Task
from .serializers import PresentationSerializer, ProjectSerializer, TaskSerializer


import os
import json
import logging
import groq
import re


load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

client = groq.Client(api_key=GROQ_API_KEY)

logger = logging.getLogger('api')


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

            template = f"""
            I'm an {job_role} with a {specialization} specialization who is going to give you some data/content on an idea that I have.
            Your job is to generate sensible content pertaining to the idea and generate slides for it. 
            Give approximately 10-12 slides with each slide having around 3-5 bullet points. 
            The slides should be in the order they should be presented. 
            Also highlight talking points that seem important to the user.
            GIVE THE RESPONSE IN THE FORMAT OF A JSON OBJECT. The JSON object should be formatted as follows:
            {{  
                "title": "Presentation Title",
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
        try: 
            user = request.user
            presentations = Presentation.objects.filter(user=user)
            serializer = PresentationSerializer(presentations, many=True)
            logger.info("Delivered user presentations successfully")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in user presentations view: ", str(e))
            return JsonResponse({"error": str(e)}, status=500)

class UpdatePresentationView(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, id):
        try:
            presentation = get_object_or_404(Presentation, id=id)
            if presentation.user != request.user:
                return Response({"error": "You do not have permission to update this presentation"}, status=status.HTTP_403_FORBIDDEN)
            serializer = PresentationSerializer(presentation, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in update presentation view: ", str(e))
            return JsonResponse({"error": str(e)}, status=500)
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
            logger.info(f"Deleted presentation with id: {id}")
            presentation.delete()
            return Response({"message": "Presentation deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error("Error in delete presentation view: ", str(e))
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Get all projects for the authenticated user."""
        projects = Project.objects.filter(user=request.user)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new project for the authenticated user."""
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_project(self, request, id):
        return get_object_or_404(Project, id=id, user=request.user)

    def get(self, request, id):
        project = self.get_project(request, id)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, id):
        project = self.get_project(request, id)
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        project = self.get_project(request, id)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TaskListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, project_id=None):
        """Get tasks for a specific project or all tasks if no project_id."""
        if project_id:
            project = get_object_or_404(Project, id=project_id, user=request.user)
            tasks = Task.objects.filter(project=project)
        else:
            tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        """Create a new task for a specific project."""
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Ensure the request data includes required fields
        data = request.data.copy()
        data['project'] = project.id  # Explicitly set project
        
        serializer = TaskSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(project=project)  # Assign user and project explicitly
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_task(self, request, id):
        task = get_object_or_404(Task, id=id)
        if task.project.user != request.user:  # Ensure the user owns the project
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        return task


    def get(self, request, id):
        task = self.get_task(request, id)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, id):
        task = self.get_task(request, id)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        task = self.get_task(request, id)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GetTranscriptView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Fetches a mock transcript from a file inside the 'data' folder."""
        mock_transcript = '{"conversations": [{"timestamp": "2025-02-25T02:57:31.873907","speaker": "Bot","text": "Hey, ready to tell me your completed tasks and your new tasks?"},{"timestamp": "2025-02-25T02:57:39.144934","speaker": "User","text": "Yeah."},{"timestamp": "2025-02-25T02:57:46.606046","speaker": "User","text": "So I\'ve pasted a front end, and I\'ve created a dataset."},{"timestamp": "2025-02-25T02:58:10.123456","speaker": "User","text": "I also set up the API for fetching presentation data and integrated it with the frontend."},{"timestamp": "2025-02-25T02:58:18.654321","speaker": "User","text": "And I implemented authentication using JWT tokens in Django."},{"timestamp": "2025-02-25T02:58:25.789012","speaker": "User","text": "So there\'s nothing left?"},{"timestamp": "2025-02-25T02:58:27.453830","speaker": "User","text": "Uh,"},{"timestamp": "2025-02-25T02:58:30.123456","speaker": "User","text": "Oh, my project is almost complete."},{"timestamp": "2025-02-25T02:58:35.987654","speaker": "Bot","text": "That’s great! Do you have any final tasks left to polish it up?"},{"timestamp": "2025-02-25T02:58:42.654321","speaker": "User","text": "Actually, yeah. I need to refine the UI design, add error handling, and improve the presentation generation quality."},{"timestamp": "2025-02-25T02:58:50.987654","speaker": "User","text": "Also, I need to test the entire flow end-to-end and fix any issues that come up."},{"timestamp": "2025-02-25T02:58:55.321987","speaker": "Bot","text": "Nice! Once you finish those, your project should be solid. Let me know if you need help."},{"timestamp": "2025-02-25T02:59:02.654321","speaker": "User","text": "Will do. Thanks!"}]}'
        # if not os.path.exists(transcript_path):
        #     logger.error("Transcript file not found")
        #     return Response({"error": "Transcript file not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # with open(transcript_path, "r", encoding="utf-8") as file:
            #     mock_transcript = file.read()

            return Response(json.loads(mock_transcript), status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error reading transcript file: {str(e)}")
            return Response({"error": "Failed to read transcript file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ProcessTranscriptView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """Processes the transcript, extracts tasks, and updates the DB accordingly."""
        try:
            data = json.loads(request.body)
            transcript = data.get("transcript")

            if not transcript:
                return Response({"error": "Transcript is required"}, status=status.HTTP_400_BAD_REQUEST)

            logger.info(f"Received transcript: {transcript}")

            # Call LLM to analyze transcript
            tasks_data = self.analyze_transcript_with_llm(transcript)
            
            logger.info(f"Extracted tasks: {tasks_data}")

            if not tasks_data:
                return Response({"error": "No tasks extracted from LLM"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            completed_tasks = tasks_data.get("completed_tasks", [])
            new_tasks = tasks_data.get("new_tasks", [])

            # Process tasks in the database
            self.process_tasks(request.user, completed_tasks, new_tasks)

            return Response(
                {
                    "message": "Tasks processed successfully",
                    "completed_tasks": completed_tasks,
                    "new_tasks": new_tasks,
                },
                status=status.HTTP_200_OK,
            )

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return Response({"error": "Invalid JSON in request body"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in ProcessTranscriptView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def analyze_transcript_with_llm(self, transcript):
        """Calls LLM to extract completed and new tasks from the transcript."""
        template = f"""
        You are an AI assistant analyzing a conversation transcript. Your task is to:
        - Identify **tasks the user has completed**.
        - Identify **new tasks the user should work on**.

        ### **Response Format (ONLY JSON)**
        ```json
        {{
            "completed_tasks": ["Completed Task 1", "Completed Task 2"],
            "new_tasks": [
                {{"title": "New Task 1", "description": "Details about Task 1"}},
                {{"title": "New Task 2", "description": "Details about Task 2"}}
            ]
        }}
        ```

        **Transcript:**  
        {transcript}
        """

        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": template}],
                model="llama3-8b-8192",
            )

            response = chat_completion.choices[0].message.content
            logger.info(f"Raw LLM Response: {response}")

            # Extract JSON properly
            match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if match:
                response_cleaned = match.group(1).strip()
            else:
                # Fallback: Try to extract anything that looks like JSON
                response_cleaned = re.search(r'{.*}', response, re.DOTALL)
                response_cleaned = response_cleaned.group(0).strip() if response_cleaned else ""

            if not response_cleaned:
                logger.error(f"LLM returned invalid JSON: {response}")
                return {"completed_tasks": [], "new_tasks": []}

            logger.info(f"Extracted JSON from LLM: {response_cleaned}")

            # Parse JSON
            parsed_response = json.loads(response_cleaned)

            return parsed_response

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON from LLM: {str(e)} | Response: {response}")
            return {"completed_tasks": [], "new_tasks": []}
        except Exception as e:
            logger.error(f"Error in LLM analysis: {str(e)}")
            return {"completed_tasks": [], "new_tasks": []}

    def process_tasks(self, user, completed_tasks, new_tasks):
        """Updates the database with completed and new tasks."""
        project = Project.objects.filter(user=user).first()

        if not project:
            logger.error(f"No active project found for user {user}. Cannot assign tasks.")
            return Response({"error": "No active project found for user."}, status=status.HTTP_400_BAD_REQUEST)

        # Process completed tasks
        for task_title in completed_tasks:
            task = Task.objects.filter(user=user, project=project, title=task_title).first()
            if task:
                if task.status != "COMPLETED":
                    task.status = "COMPLETED"
                    task.save()
                    logger.info(f"Task '{task_title}' marked as completed.")
            else:
                Task.objects.create(user=user, project=project, title=task_title, status="COMPLETED")
                logger.info(f"Completed task '{task_title}' created.")

        # Process new tasks
        for task_data in new_tasks:
            task, created = Task.objects.get_or_create(
                user=user,
                project=project,
                title=task_data["title"],
                defaults={
                    "description": task_data["description"],
                    "status": "TODO"
                },
            )
            if created:
                logger.info(f"New task added: {task.title}")
            else:
                logger.info(f"Task '{task.title}' already exists. Skipping duplicate.")

