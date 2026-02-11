from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User


class AuthTests(TestCase):
    def test_token_obtain_restricted_to_staff(self):
        client = APIClient()
        # Create normal user
        u = User.objects.create_user(username='normal', password='pass123')
        # Create staff user
        s = User.objects.create_user(username='admin', password='admin123')
        s.is_staff = True
        s.save()

        # Normal user should NOT obtain token
        resp = client.post('/api/v1/auth/token/', {'username': 'normal', 'password': 'pass123'}, format='json')
        self.assertNotEqual(resp.status_code, 200)

        # Staff user should obtain token
        resp2 = client.post('/api/v1/auth/token/', {'username': 'admin', 'password': 'admin123'}, format='json')
        self.assertEqual(resp2.status_code, 200)
        self.assertIn('access', resp2.data)

