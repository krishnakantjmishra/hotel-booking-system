"""
Comprehensive debug script for login issue
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

def debug_login():
    username = "admin"
    password = "admin123"
    
    print("=" * 70)
    print("COMPREHENSIVE LOGIN DEBUG")
    print("=" * 70)
    
    # List all users
    print("\n[1] ALL USERS IN DATABASE:")
    print("-" * 70)
    all_users = User.objects.all()
    if all_users.exists():
        for user in all_users:
            print(f"  ID: {user.id} | Username: {user.username} | Email: {user.email}")
            print(f"      is_active: {user.is_active} | is_staff: {user.is_staff} | is_superuser: {user.is_superuser}")
    else:
        print("  No users found!")
    
    # Check admin user specifically
    print(f"\n[2] CHECKING ADMIN USER:")
    print("-" * 70)
    try:
        admin_user = User.objects.get(username=username)
        print(f"  [FOUND] User '{username}' exists")
        print(f"    ID: {admin_user.id}")
        print(f"    Email: {admin_user.email}")
        print(f"    is_active: {admin_user.is_active}")
        print(f"    is_staff: {admin_user.is_staff}")
        print(f"    is_superuser: {admin_user.is_superuser}")
        print(f"    date_joined: {admin_user.date_joined}")
        print(f"    last_login: {admin_user.last_login}")
        
        # Test password
        print(f"\n  [PASSWORD TEST]")
        password_check = admin_user.check_password(password)
        print(f"    Password '{password}' check: {password_check}")
        
        if not password_check:
            print(f"    [FIXING] Password doesn't match. Resetting...")
            admin_user.set_password(password)
            admin_user.save()
            print(f"    [FIXED] Password reset to '{password}'")
            admin_user.refresh_from_db()
            password_check = admin_user.check_password(password)
            print(f"    [VERIFIED] Password check after reset: {password_check}")
        
        # Ensure user is active and has admin privileges
        modified = False
        if not admin_user.is_active:
            print(f"\n  [FIXING] User is not active. Activating...")
            admin_user.is_active = True
            modified = True
            print(f"    [FIXED] User is now active")

        if not admin_user.is_staff:
            print(f"\n  [FIXING] User is not staff. Granting staff rights...")
            admin_user.is_staff = True
            modified = True

        if not admin_user.is_superuser:
            print(f"\n  [FIXING] User is not superuser. Granting superuser rights...")
            admin_user.is_superuser = True
            modified = True

        if modified:
            admin_user.save()
        
        # Test Django authentication
        print(f"\n[3] TESTING DJANGO AUTHENTICATION:")
        print("-" * 70)
        authenticated_user = authenticate(username=username, password=password)
        
        if authenticated_user:
            print(f"  [SUCCESS] Django authenticate() returned user:")
            print(f"    Username: {authenticated_user.username}")
            print(f"    is_active: {authenticated_user.is_active}")
        else:
            print(f"  [FAILED] Django authenticate() returned None")
            print(f"    This means authentication failed!")
            
            # Try to diagnose
            print(f"\n  [DIAGNOSIS]")
            admin_user.refresh_from_db()
            print(f"    User exists: True")
            print(f"    User is_active: {admin_user.is_active}")
            print(f"    Password check: {admin_user.check_password(password)}")
            
            # Force reset everything
            print(f"\n  [FORCE RESET] Resetting everything...")
            admin_user.is_active = True
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password(password)
            admin_user.save()
            print(f"    [RESET] All flags set and password reset")
            
            # Test again
            authenticated_user = authenticate(username=username, password=password)
            if authenticated_user:
                print(f"    [SUCCESS] Authentication works after reset!")
            else:
                print(f"    [STILL FAILED] Authentication still fails after reset")
                print(f"    This might indicate a database or configuration issue")
        
        # Final status
        print(f"\n[4] FINAL STATUS:")
        print("-" * 70)
        admin_user.refresh_from_db()
        print(f"  Username: {admin_user.username}")
        print(f"  Password: {password}")
        print(f"  is_active: {admin_user.is_active}")
        print(f"  is_staff: {admin_user.is_staff}")
        print(f"  is_superuser: {admin_user.is_superuser}")
        print(f"  Password verified: {admin_user.check_password(password)}")
        print(f"  Django auth works: {authenticated_user is not None}")
        
        return authenticated_user is not None
        
    except User.DoesNotExist:
        print(f"  [NOT FOUND] User '{username}' does not exist!")
        print(f"  [CREATING] Creating admin user...")
        
        admin_user = User.objects.create_superuser(
            username=username,
            email="admin@example.com",
            password=password
        )
        
        print(f"  [CREATED] Admin user created!")
        print(f"    Username: {admin_user.username}")
        print(f"    Password: {password}")
        print(f"    is_active: {admin_user.is_active}")
        print(f"    is_staff: {admin_user.is_staff}")
        print(f"    is_superuser: {admin_user.is_superuser}")
        
        # Test authentication
        authenticated_user = authenticate(username=username, password=password)
        if authenticated_user:
            print(f"  [SUCCESS] Authentication works!")
            return True
        else:
            print(f"  [FAILED] Authentication still fails!")
            return False
    
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\nThis script will:")
    print("1. List all users in database")
    print("2. Check admin user status")
    print("3. Test Django authentication")
    print("4. Fix any issues found")
    print("\nPress Ctrl+C to cancel, or wait 2 seconds...")
    import time
    time.sleep(2)
    
    success = debug_login()
    
    print(f"\n" + "=" * 70)
    if success:
        print("[SUCCESS] Admin user is ready for login!")
        print("=" * 70)
        print(f"\nTry logging in now:")
        print(f"  URL: http://localhost:3000/login")
        print(f"  Username: admin")
        print(f"  Password: admin123")
        print(f"\nOr test API directly:")
        print(f"  POST http://127.0.0.1:8000/api/v1/auth/token/")
        print(f'  Body: {{"username": "admin", "password": "admin123"}}')
    else:
        print("[FAILED] Login issue persists!")
        print("=" * 70)
        print(f"\nPossible issues:")
        print(f"1. Database connection problem")
        print(f"2. Multiple databases configured")
        print(f"3. User in different database")
        print(f"4. Check Django settings.py for AUTHENTICATION_BACKENDS")

