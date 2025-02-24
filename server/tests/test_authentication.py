from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        """Set up test client and URLs."""
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.select_role_url = reverse('select-role')
        self.logout_url = reverse('logout')

        # Test user data
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }

    def test_signup_success(self):
        """Test successful user signup."""
        response = self.client.post(self.signup_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())

        # Check that access and refresh tokens are present
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_signup_missing_fields(self):
        """Test signup failure when required fields are missing."""
        incomplete_data = {'email': 'test@example.com'}
        response = self.client.post(self.signup_url, incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_duplicate_email(self):
        """Test that signing up with an existing email fails."""
        # First signup attempt
        self.client.post(self.signup_url, self.user_data, format='json')

        # Second attempt with the same email
        duplicate_data = {
            'username': 'testuser2',
            'email': 'test@example.com',
            'password': 'testpass456'
        }
        response = self.client.post(self.signup_url, duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_select_role_success(self):
        """Test selecting a job role and specialization successfully."""
        # Create and authenticate user
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)

        role_data = {
            'job_role': 'developer',
            'specialization': 'backend'
        }
        response = self.client.post(self.select_role_url, role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh user from DB and check updated fields
        user.refresh_from_db()
        self.assertEqual(user.job_role, 'developer')
        self.assertEqual(user.specialization, 'backend')

    def test_select_role_missing_fields(self):
        """Test failure when selecting a role without required fields."""
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)

        incomplete_data = {'job_role': 'developer'}
        response = self.client.post(self.select_role_url, incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_select_role_unauthenticated(self):
        """Test that an unauthenticated user cannot select a role."""
        role_data = {
            'job_role': 'developer',
            'specialization': 'backend'
        }
        response = self.client.post(self.select_role_url, role_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_success(self):
        """Test successful logout after logging in the user."""
        # Step 1: Create a user
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)

        # Step 2: Get a refresh token by making a login request
        login_response = self.client.post('/token/', {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }, format='json')

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

        # Step 3: Logout using the refresh token
        logout_response = self.client.post(self.logout_url, {
            'refresh_token': login_response.data['refresh']
        }, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_missing_token(self):
        """Test that logout fails if the refresh token is missing."""
        # First authenticate the user
        user = User.objects.create_user(**self.user_data)
        self.client.force_authenticate(user=user)
        
        # Try to logout without a refresh token
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
