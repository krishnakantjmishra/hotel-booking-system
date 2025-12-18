"""
Test JWT endpoint directly using Django test client
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

def test_jwt_endpoint():
    username = "admin"
    password = "admin123"
    
    print("=" * 70)
    print("TESTING JWT TOKEN ENDPOINT")
    print("=" * 70)
    
    # Verify user first
    try:
        user = User.objects.get(username=username)
        print(f"\n[USER CHECK]")
        print(f"  Username: {user.username}")
        print(f"  is_active: {user.is_active}")
        print(f"  Password check: {user.check_password(password)}")
        
        if not user.is_active:
            user.is_active = True
            user.save()
            print(f"  [FIXED] Activated user")
        
        if not user.check_password(password):
            user.set_password(password)
            user.save()
            print(f"  [FIXED] Reset password")
    except User.DoesNotExist:
        print(f"\n[ERROR] User not found!")
        return False
    
    # Test with Django test client
    print(f"\n[TEST 1] Testing with Django test client:")
    print("-" * 70)
    client = Client()
    
    response = client.post(
        '/api/v1/auth/token/',
        data=json.dumps({
            'username': username,
            'password': password
        }),
        content_type='application/json'
    )
    
    print(f"  Status Code: {response.status_code}")
    print(f"  Response: {response.content.decode()}")
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"  [SUCCESS] Token received!")
        print(f"    Access token: {data.get('access', 'N/A')[:50]}...")
        return True
    else:
        try:
            error_data = json.loads(response.content)
            print(f"  [FAILED] Error: {error_data}")
        except:
            print(f"  [FAILED] Raw response: {response.content.decode()}")
    
    # Test with different username formats
    print(f"\n[TEST 2] Testing with different username formats:")
    print("-" * 70)
    
    test_cases = [
        {'username': username, 'password': password},
        {'username': username.upper(), 'password': password},
        {'username': username.lower(), 'password': password},
        {'username': username.strip(), 'password': password},
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n  Test {i}: username='{test_case['username']}'")
        response = client.post(
            '/api/v1/auth/token/',
            data=json.dumps(test_case),
            content_type='application/json'
        )
        if response.status_code == 200:
            print(f"    [SUCCESS] Login worked!")
            return True
        else:
            print(f"    [FAILED] Status: {response.status_code}")
    
    return False

if __name__ == "__main__":
    success = test_jwt_endpoint()
    
    print(f"\n" + "=" * 70)
    if success:
        print("[SUCCESS] JWT endpoint is working!")
    else:
        print("[FAILED] JWT endpoint test failed!")
        print("\nPossible solutions:")
        print("1. Check if rest_framework_simplejwt is installed")
        print("2. Verify INSTALLED_APPS includes 'rest_framework'")
        print("3. Check REST_FRAMEWORK settings in settings.py")
        print("4. Try restarting Django server")
    print("=" * 70)

