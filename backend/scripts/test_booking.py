import requests

BASE = 'http://127.0.0.1:8000'

# Login and get token
r = requests.post(f'{BASE}/api/v1/auth/token/', json={'username':'admin','password':'admin123'})
print('Token status', r.status_code)
if r.status_code != 200:
    print('Failed to obtain token', r.text)
    exit(1)

token = r.json()['access']
print('Token OK')

headers = {'Authorization': f'Bearer {token}'}

# Get a room from admin API
r = requests.get(f'{BASE}/api/admin/rooms/', headers=headers)
print('Rooms status', r.status_code)
print(r.text)
if r.status_code != 200:
    exit(1)

rooms = r.json().get('results', r.json())
if not rooms:
    print('No rooms found; please create one via admin panel')
    exit(1)

room = rooms[0]
print('Using room', room['id'], room['room_name'])

# Post a booking
booking = {
    'room': room['id'],
    'check_in': '2025-12-20',
    'check_out': '2025-12-22'
}

r = requests.post(f'{BASE}/api/v1/bookings/', json=booking, headers={**headers, 'Content-Type': 'application/json'})
print('Booking status', r.status_code)
print(r.text)
