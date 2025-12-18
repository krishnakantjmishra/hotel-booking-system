from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Hotel, Room, RoomInventory


class RoomInventoryModelTests(TestCase):
	def setUp(self):
		self.hotel = Hotel.objects.create(name='Test Hotel', city='Test City', address='123 Test St', rating=4.5, price_min=100)
		self.room = Room.objects.create(hotel=self.hotel, room_name='Standard Room', price_per_night=100, total_rooms=5, available_rooms=5)

	def test_available_rooms_calculation(self):
		ri = RoomInventory(room=self.room, date='2025-12-15', total_rooms=5, booked_rooms=2)
		self.assertEqual(ri.available_rooms, 3)

	def test_available_rooms_clamped_to_zero(self):
		ri = RoomInventory(room=self.room, date='2025-12-16', total_rooms=5, booked_rooms=7)
		# property should clamp negative to zero
		self.assertEqual(ri.available_rooms, 0)

	def test_clean_raises_when_booked_exceeds_total(self):
		ri = RoomInventory(room=self.room, date='2025-12-17', total_rooms=5, booked_rooms=7)
		with self.assertRaises(ValidationError):
			ri.full_clean()
