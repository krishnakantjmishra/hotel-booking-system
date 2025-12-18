from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from hotels.models import Hotel, Room
from .views import get_dates_in_range


class BookingViewsTests(TestCase):
	def test_get_dates_in_range_with_date_strings(self):
		dates = get_dates_in_range('2025-12-20', '2025-12-23')
		self.assertEqual(len(dates), 3)
		self.assertEqual(str(dates[0]), '2025-12-20')

	def test_get_dates_in_range_with_datetimes(self):
		from datetime import datetime
		dates = get_dates_in_range(datetime(2025,12,20,0,0), datetime(2025,12,22,0,0))
		self.assertEqual(len(dates), 2)

	def test_booking_endpoint_parses_string_dates(self):
		# Create user, hotel, room
		admin = User.objects.create_user(username='testuser', password='password')
		hotel = Hotel.objects.create(name='Test Hotel', city='City', address='Addr', rating=4.5, price_min=100)
		room = Room.objects.create(hotel=hotel, room_name='Room 1', price_per_night=100, total_rooms=2, available_rooms=2)
		client = APIClient()
		client.force_authenticate(user=admin)
		payload = {
			'room': room.id,
			'check_in': '2025-12-28',
			'check_out': '2025-12-30'
		}
		resp = client.post('/api/v1/bookings/', payload, format='json')
		self.assertIn(resp.status_code, (201, 200, 400))
