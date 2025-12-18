"""
Script to create an admin user for the hotel booking system.
Usage: python create_admin.py
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
    username = input("Enter username (default: admin): ").strip() or "admin"
    email = input("Enter email (default: admin@example.com): ").strip() or "admin@example.com"
    password = input("Enter password: ").strip()
    
    if not password:
        print("Error: Password is required!")
        return
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        print(f"✓ Updated existing user '{username}' to admin")
    else:
        # Create new admin user
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✓ Created admin user '{username}'")
    
    print(f"\nYou can now login with:")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"\nAPI Login endpoint: POST http://127.0.0.1:8000/api/v1/auth/token/")
    print(f"Body: {{'username': '{username}', 'password': '{password}'}}")

if __name__ == "__main__":
    create_admin_user()

