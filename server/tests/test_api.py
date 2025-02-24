from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient
from rest_framework import status

from api.models import Presentation

from unittest.mock import patch

User = get_user_model()

class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a test presentation
        self.presentation = Presentation.objects.create(
            user=self.user,
            title="Test Presentation",
            data={
                "slides": [
                    {"title": "Slide 1", "content": ["Point 1", "Point 2"]},
                    {"title": "Slide 2", "content": ["Point 3", "Point 4"]}
                ],
                "talking_points": ["Talk point 1", "Talk point 2"]
            }
        )

    def test_home_view(self):
        url = reverse('home')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_message = 'Welcome to the JWT Authentication page using React and Django'
        self.assertEqual(response.data['message'], expected_message)

    @patch('groq.Client')
    def test_create_presentation_success(self, mock_groq):
        # Mock the LLM response
        mock_response = type('Response', (), {
            'model': 'mixtral-8x7b-32768',
            'choices': [type('Choice', (), {
                'text': '''
                { 
                    "data": {
                        "slides": [
                            {"title": "Introduction", "content": ["Point 1", "Point 2"]},
                            {"title": "Main Content", "content": ["Point 3", "Point 4"]},
                            {"title": "Conclusion", "content": ["Point 5", "Point 6"]}
                        ],
                        "talking_points": ["Talk point 1", "Talk point 2"]
                    },
                    "title": "Sample Presentation"
                }
                '''
            })]
        })
        mock_groq.return_value.chat.completions.create.return_value = mock_response

        url = reverse('create-ppt')
        data = {'prompt': 'Create a presentation about AI'}
        response = self.client.post(url, data, format='json')

        response_json = response.json()  # Fix: Use .json() instead of .data

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_json['message'], 'Presentation created successfully')
        self.assertIn('presentation_id', response_json)
        self.assertIn('title', response_json)


    def test_create_presentation_no_prompt(self):
        url = reverse('create-ppt')
        data = {}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fetch_presentations(self):
        url = reverse('fetch-ppt')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should return our test presentation
        self.assertEqual(response.data[0]['title'], 'Test Presentation')

    def test_update_presentation_success(self):
        url = reverse('update-ppt', kwargs={'id': self.presentation.id})
        update_data = {'title': 'Updated Title'}
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_update_presentation_unauthorized(self):
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=other_user)
        
        url = reverse('update-ppt', kwargs={'id': self.presentation.id})
        update_data = {'title': 'Updated Title'}
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_presentation_success(self):
        url = reverse('delete-ppt', kwargs={'id': self.presentation.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Presentation.objects.filter(id=self.presentation.id).exists())

    def test_delete_presentation_unauthorized(self):
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=other_user)
        
        url = reverse('delete-ppt', kwargs={'id': self.presentation.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
