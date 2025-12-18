"""
Compare admin user with working users to find the issue
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

def compare_users():
    print("=" * 70)
    print("COMPARING ADMIN USER WITH WORKING USERS")
    print("=" * 70)
    
    # Get admin user
    try:
        admin = User.objects.get(username="admin")
        print(f"\n[ADMIN USER]")
        print(f"  Username: '{admin.username}' (length: {len(admin.username)})")
        print(f"  Email: '{admin.email}'")
        print(f"  is_active: {admin.is_active}")
        print(f"  is_staff: {admin.is_staff}")
        print(f"  is_superuser: {admin.is_superuser}")
        print(f"  date_joined: {admin.date_joined}")
        print(f"  last_login: {admin.last_login}")
        print(f"  Password hash: {admin.password[:50]}...")
        
        # Test authentication
        auth_result = authenticate(username="admin", password="admin123")
        print(f"  Django authenticate(): {auth_result is not None}")
        if auth_result:
            print(f"    Authenticated user: {auth_result.username}")
        
    except User.DoesNotExist:
        print(f"\n[ERROR] Admin user not found!")
        return
    
    # Get a working user (yash)
    try:
        working_user = User.objects.get(username="yash")
        print(f"\n[WORKING USER - yash]")
        print(f"  Username: '{working_user.username}' (length: {len(working_user.username)})")
        print(f"  Email: '{working_user.email}'")
        print(f"  is_active: {working_user.is_active}")
        print(f"  is_staff: {working_user.is_staff}")
        print(f"  is_superuser: {working_user.is_superuser}")
        print(f"  date_joined: {working_user.date_joined}")
        print(f"  last_login: {working_user.last_login}")
        
        # Test authentication (if we know the password)
        print(f"  Django authenticate(): (password unknown)")
        
    except User.DoesNotExist:
        print(f"\n[INFO] Working user 'yash' not found, checking other users...")
        all_users = User.objects.all()
        if all_users.exists():
            working_user = all_users.first()
            print(f"\n[COMPARING WITH FIRST USER - {working_user.username}]")
            print(f"  Username: '{working_user.username}'")
            print(f"  is_active: {working_user.is_active}")
    
    # Check for differences
    print(f"\n[DIFFERENCES]")
    print("-" * 70)
    
    differences = []
    if admin.is_active != working_user.is_active:
        differences.append(f"is_active: admin={admin.is_active}, working={working_user.is_active}")
    if admin.is_staff != working_user.is_staff:
        differences.append(f"is_staff: admin={admin.is_staff}, working={working_user.is_staff}")
    if admin.is_superuser != working_user.is_superuser:
        differences.append(f"is_superuser: admin={admin.is_superuser}, working={working_user.is_superuser}")
    
    if differences:
        print(f"  Found differences:")
        for diff in differences:
            print(f"    - {diff}")
    else:
        print(f"  No significant differences found")
    
    # Check username encoding
    print(f"\n[USERNAME ENCODING CHECK]")
    print("-" * 70)
    admin_username_bytes = admin.username.encode('utf-8')
    print(f"  Admin username bytes: {admin_username_bytes}")
    print(f"  Admin username repr: {repr(admin.username)}")
    
    # Try to fix admin user by recreating it
    print(f"\n[FIX ATTEMPT]")
    print("-" * 70)
    print(f"  Resetting admin user completely...")
    
    # Delete and recreate
    admin_id = admin.id
    admin_email = admin.email
    admin.delete()
    print(f"  [DELETED] Old admin user removed")
    
    # Create fresh admin user
    new_admin = User.objects.create_superuser(
        username="admin",
        email=admin_email,
        password="admin123"
    )
    print(f"  [CREATED] New admin user created (ID: {new_admin.id})")
    print(f"    Username: {new_admin.username}")
    print(f"    is_active: {new_admin.is_active}")
    print(f"    is_staff: {new_admin.is_staff}")
    print(f"    is_superuser: {new_admin.is_superuser}")
    
    # Test authentication
    auth_result = authenticate(username="admin", password="admin123")
    if auth_result:
        print(f"  [SUCCESS] Authentication works with new admin user!")
        return True
    else:
        print(f"  [FAILED] Authentication still fails!")
        return False

if __name__ == "__main__":
    success = compare_users()
    
    print(f"\n" + "=" * 70)
    if success:
        print("[SUCCESS] Admin user has been recreated and should work now!")
        print("=" * 70)
        print(f"\nTry logging in with:")
        print(f"  Username: admin")
        print(f"  Password: admin123")
    else:
        print("[WARNING] Issue may persist. Check database connection.")
        print("=" * 70)

