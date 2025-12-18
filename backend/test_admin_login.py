"""
Test script to verify admin login credentials
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def test_admin_login():
    username = "admin"
    password = "admin123"
    
    try:
        user = User.objects.get(username=username)
        print(f"User found: {username}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  is_superuser: {user.is_superuser}")
        print(f"  is_active: {user.is_active}")
        
        # Test password
        if user.check_password(password):
            print(f"  Password check: CORRECT")
        else:
            print(f"  Password check: INCORRECT")
            print(f"\nResetting password to 'admin123'...")
            user.set_password(password)
            user.save()
            print(f"  Password reset complete!")
            
    except User.DoesNotExist:
        print(f"User '{username}' not found!")
        print("Creating admin user...")
        user = User.objects.create_superuser(
            username=username,
            email="admin@example.com",
            password=password
        )
        print(f"Admin user created!")

if __name__ == "__main__":
    test_admin_login()

