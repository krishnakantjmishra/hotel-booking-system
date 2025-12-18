"""
Comprehensive script to verify and fix admin user for login
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def verify_and_fix_admin():
    username = "admin"
    password = "admin123"
    
    print("=" * 50)
    print("ADMIN USER VERIFICATION AND FIX")
    print("=" * 50)
    
    # Check if user exists
    try:
        user = User.objects.get(username=username)
        print(f"\n[FOUND] User '{username}' exists")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {user.email}")
        print(f"  - is_active: {user.is_active}")
        print(f"  - is_staff: {user.is_staff}")
        print(f"  - is_superuser: {user.is_superuser}")
        
        # Fix all issues
        needs_save = False
        
        if not user.is_active:
            user.is_active = True
            needs_save = True
            print(f"\n[FIX] Setting is_active = True")
        
        if not user.is_staff:
            user.is_staff = True
            needs_save = True
            print(f"[FIX] Setting is_staff = True")
        
        if not user.is_superuser:
            user.is_superuser = True
            needs_save = True
            print(f"[FIX] Setting is_superuser = True")
        
        # Always reset password to ensure it's correct
        user.set_password(password)
        needs_save = True
        print(f"[FIX] Password reset to '{password}'")
        
        if needs_save:
            user.save()
            print(f"\n[SAVED] User updated successfully")
        
        # Verify password
        user.refresh_from_db()
        if user.check_password(password):
            print(f"[VERIFIED] Password check PASSED")
        else:
            print(f"[ERROR] Password check FAILED")
            return False
        
        # Final status
        print(f"\n" + "=" * 50)
        print("FINAL STATUS:")
        print("=" * 50)
        print(f"Username: {user.username}")
        print(f"Password: {password}")
        print(f"is_active: {user.is_active}")
        print(f"is_staff: {user.is_staff}")
        print(f"is_superuser: {user.is_superuser}")
        print(f"Password verified: {user.check_password(password)}")
        
        print(f"\n" + "=" * 50)
        print("LOGIN INSTRUCTIONS:")
        print("=" * 50)
        print(f"1. Go to: http://localhost:3000/login")
        print(f"2. Username: {username}")
        print(f"3. Password: {password}")
        print(f"\nOr test via API:")
        print(f"POST http://127.0.0.1:8000/api/v1/auth/token/")
        print(f'Body: {{"username": "{username}", "password": "{password}"}}')
        
        return True
        
    except User.DoesNotExist:
        print(f"\n[NOT FOUND] User '{username}' does not exist")
        print(f"[CREATING] New admin user...")
        
        user = User.objects.create_superuser(
            username=username,
            email="admin@example.com",
            password=password
        )
        
        print(f"[SUCCESS] Admin user created!")
        print(f"  Username: {user.username}")
        print(f"  Password: {password}")
        print(f"  is_active: {user.is_active}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  is_superuser: {user.is_superuser}")
        
        return True
    
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_and_fix_admin()
    if success:
        print(f"\n[SUCCESS] Admin user is ready for login!")
    else:
        print(f"\n[FAILED] Please check the errors above")

