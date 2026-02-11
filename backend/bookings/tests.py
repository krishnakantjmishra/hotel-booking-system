from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from hotels.models import Hotel, Room
from .views import get_dates_in_range
from django.utils import timezone
import datetime as _dt



class BookingViewsTests(TestCase):
	def test_get_dates_in_range_with_date_strings(self):
		dates = get_dates_in_range('2025-12-20', '2025-12-23')
		self.assertEqual(len(dates), 3)
		self.assertEqual(str(dates[0]), '2025-12-20')

	def test_get_dates_in_range_with_datetimes(self):
		from datetime import datetime
		dates = get_dates_in_range(datetime(2025,12,20,0,0), datetime(2025,12,22,0,0))
		self.assertEqual(len(dates), 2)

	def test_public_booking_creation(self):
		# Create hotel, room
		hotel = Hotel.objects.create(name='Test Hotel', city='City', address='Addr', rating=4.5, price_min=100)
		room = Room.objects.create(hotel=hotel, room_name='Room 1', price_per_night=100, total_rooms=2, available_rooms=2)
		client = APIClient()
		payload = {
			'user_name': 'John Doe',
			'user_email': 'john@example.com',
			'room': room.id,
			'check_in': '2025-12-28',
			'check_out': '2025-12-30'
		}
		resp = client.post('/api/v1/bookings/', payload, format='json')
		self.assertEqual(resp.status_code, 201)
		self.assertEqual(resp.data['user_email'], 'john@example.com')

	def test_otp_request_and_verify_flow(self):
		client = APIClient()
		email = 'otpuser@example.com'
		# Create a server-side OTPRequest (simulating sending OTP)
		from .models import OTPRequest
		tmp = OTPRequest(email=email, expires_at=timezone.now() + _dt.timedelta(minutes=10))
		tmp.set_otp('123456')
		tmp.save()

		# Verify using API
		payload = {'email': email, 'otp': '123456'}
		resp = client.post('/api/v1/bookings/otp/verify/', payload, format='json')
		self.assertEqual(resp.status_code, 200)
		self.assertIn('token', resp.data)

