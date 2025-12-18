"""
Test the login API endpoint directly
"""
import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

def test_login():
    username = "admin"
    password = "admin123"
    api_url = "http://127.0.0.1:8000/api/v1/auth/token/"
    
    print("=" * 60)
    print("LOGIN API TEST")
    print("=" * 60)
    
    # First verify user in database
    try:
        user = User.objects.get(username=username)
        print(f"\n[DB CHECK] User found in database:")
        print(f"  Username: {user.username}")
        print(f"  is_active: {user.is_active}")
        print(f"  is_staff: {user.is_staff}")
        print(f"  Password check: {user.check_password(password)}")
        
        if not user.is_active:
            print(f"\n[FIX] User is not active! Activating...")
            user.is_active = True
            user.save()
            print(f"[FIXED] User is now active")
        
        if not user.check_password(password):
            print(f"\n[FIX] Password mismatch! Resetting...")
            user.set_password(password)
            user.save()
            print(f"[FIXED] Password reset")
            
    except User.DoesNotExist:
        print(f"\n[ERROR] User '{username}' not found in database!")
        print(f"[CREATING] Creating admin user...")
        user = User.objects.create_superuser(
            username=username,
            email="admin@example.com",
            password=password
        )
        print(f"[CREATED] Admin user created")
    
    # Test API endpoint
    print(f"\n[API TEST] Testing login endpoint...")
    print(f"  URL: {api_url}")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    
    try:
        response = requests.post(
            api_url,
            json={
                "username": username,
                "password": password
            },
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"\n[RESPONSE] Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Login successful!")
            print(f"  Access token received: {data.get('access', 'N/A')[:50]}...")
            print(f"  Refresh token received: {data.get('refresh', 'N/A')[:50]}...")
            return True
        else:
            print(f"[FAILED] Login failed!")
            print(f"  Response: {response.text}")
            try:
                error_data = response.json()
                print(f"  Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"  Raw response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Cannot connect to backend server!")
        print(f"  Make sure Django server is running:")
        print(f"  cd backend")
        print(f"  python manage.py runserver")
        return False
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\nMake sure Django server is running on http://127.0.0.1:8000")
    print("Press Ctrl+C to cancel, or wait 3 seconds...")
    import time
    time.sleep(3)
    
    success = test_login()
    
    if success:
        print(f"\n" + "=" * 60)
        print("[SUCCESS] Login API is working!")
        print("=" * 60)
        print(f"\nYou can now login at http://localhost:3000/login")
        print(f"  Username: admin")
        print(f"  Password: admin123")
    else:
        print(f"\n" + "=" * 60)
        print("[FAILED] Login API test failed!")
        print("=" * 60)
        print(f"\nTroubleshooting:")
        print(f"1. Make sure Django server is running: python manage.py runserver")
        print(f"2. Check backend URL in frontend/.env: REACT_APP_API_BASE_URL=http://127.0.0.1:8000")
        print(f"3. Verify database connection")
        print(f"4. Check browser console for CORS errors")

