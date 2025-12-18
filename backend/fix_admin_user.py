"""
Fix admin user - ensure it's active and password is set correctly
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def fix_admin_user():
    username = "admin"
    password = "admin123"
    
    try:
        user = User.objects.get(username=username)
        print(f"Found user: {username}")
        
        # Ensure user is active
        if not user.is_active:
            user.is_active = True
            print("  - Activated user")
        
        # Ensure user is staff and superuser
        if not user.is_staff:
            user.is_staff = True
            print("  - Set is_staff = True")
        
        if not user.is_superuser:
            user.is_superuser = True
            print("  - Set is_superuser = True")
        
        # Reset password
        user.set_password(password)
        print("  - Password reset")
        
        user.save()
        
        print(f"\n[SUCCESS] Admin user fixed!")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"  is_active: {user.is_active}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  is_superuser: {user.is_superuser}")
        
        # Verify password
        if user.check_password(password):
            print(f"\n[VERIFIED] Password check passed!")
        else:
            print(f"\n[ERROR] Password check failed!")
            
    except User.DoesNotExist:
        print(f"User '{username}' not found. Creating...")
        user = User.objects.create_superuser(
            username=username,
            email="admin@example.com",
            password=password
        )
        print(f"[SUCCESS] Admin user created!")

if __name__ == "__main__":
    fix_admin_user()

