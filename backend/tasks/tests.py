from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task

User = get_user_model()

class TaskManagerTests(APITestCase):
    def setUp(self):
        # Create two test users
        self.user_a_data = {
            'username': 'usera',
            'email': 'usera@example.com',
            'password': 'password123'
        }
        self.user_b_data = {
            'username': 'userb',
            'email': 'userb@example.com',
            'password': 'password123'
        }
        self.user_a = User.objects.create_user(**self.user_a_data)
        self.user_b = User.objects.create_user(**self.user_b_data)

        # URLs
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.task_list_url = reverse('task-list')

        # SimpleJWT login for User A
        response = self.client.post(self.login_url, {
            'username': 'usera',
            'password': 'password123'
        })
        self.user_a_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_a_token}')

    def test_user_registration(self):
        self.client.credentials()  # Clear credentials
        registration_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepassword'
        }
        response = self.client.post(self.register_url, registration_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertEqual(response.data['email'], 'newuser@example.com')
        self.assertNotIn('password', response.data)  # password should be write-only

    def test_user_registration_duplicate_email(self):
        self.client.credentials()  # Clear credentials
        registration_data = {
            'username': 'anotheruser',
            'email': 'usera@example.com',  # Already exists
            'password': 'securepassword'
        }
        response = self.client.post(self.register_url, registration_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_login(self):
        self.client.credentials()  # Clear credentials
        response = self.client.post(self.login_url, {
            'username': 'usera',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_protected_endpoints_deny_anonymous(self):
        self.client.credentials()  # Clear credentials
        response = self.client.get(self.task_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task(self):
        task_data = {
            'title': 'Test Task',
            'description': 'Test Description'
        }
        response = self.client.post(self.task_list_url, task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Task')
        self.assertEqual(response.data['completed'], False)
        self.assertEqual(response.data['user']['username'], 'usera')

    def test_get_tasks_list(self):
        Task.objects.create(title='Task 1', user=self.user_a)
        Task.objects.create(title='Task 2', user=self.user_a)
        
        response = self.client.get(self.task_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_update_task(self):
        task = Task.objects.create(title='Old Title', description='Old Desc', user=self.user_a)
        detail_url = reverse('task-detail', kwargs={'pk': task.id})
        
        update_data = {
            'title': 'New Title',
            'completed': True
        }
        response = self.client.patch(detail_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'New Title')
        self.assertEqual(response.data['completed'], True)

    def test_delete_task(self):
        task = Task.objects.create(title='To Delete', user=self.user_a)
        detail_url = reverse('task-detail', kwargs={'pk': task.id})
        
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_user_cannot_access_others_tasks(self):
        # Create a task for User A
        task_a = Task.objects.create(title="User A's Task", user=self.user_a)
        
        # Log in as User B
        response_b = self.client.post(self.login_url, {
            'username': 'userb',
            'password': 'password123'
        })
        user_b_token = response_b.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_b_token}')

        # 1. User B lists tasks - should be empty
        response = self.client.get(self.task_list_url)
        self.assertEqual(len(response.data), 0)

        # 2. User B retrieves User A's task - should return 404
        detail_url = reverse('task-detail', kwargs={'pk': task_a.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # 3. User B updates User A's task - should return 404
        response = self.client.patch(detail_url, {'title': 'Hacked Title'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # 4. User B deletes User A's task - should return 404
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Task.objects.filter(id=task_a.id).exists())

    def test_task_filtering(self):
        Task.objects.create(title='Meeting', description='Discuss budget', completed=False, user=self.user_a)
        Task.objects.create(title='Buy groceries', description='Milk and bread', completed=True, user=self.user_a)

        # Filter by completed=true (Completed)
        response = self.client.get(f'{self.task_list_url}?completed=true')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Buy groceries')

        # Filter by completed=false (Pending)
        response = self.client.get(f'{self.task_list_url}?completed=false')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Meeting')
