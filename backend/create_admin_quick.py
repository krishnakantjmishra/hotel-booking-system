"""
Quick script to create an admin user with default credentials.
Usage: python create_admin_quick.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def create_admin_user():
    username = "admin"
    email = "admin@example.com"
    password = "admin123"  # Change this in production!
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        print(f"[OK] Updated existing user '{username}' to admin")
    else:
        # Create new admin user
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"[OK] Created admin user '{username}'")
    
    print(f"\nAdmin credentials:")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"\nLogin via API:")
    print(f"  POST http://127.0.0.1:8000/api/v1/auth/token/")
    print(f"  Body: {{'username': '{username}', 'password': '{password}'}}")
    print(f"\nOr login via frontend: http://localhost:3000/login")

if __name__ == "__main__":
    create_admin_user()

