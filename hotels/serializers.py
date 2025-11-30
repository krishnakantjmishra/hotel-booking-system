from rest_framework import serializers
from .models import Hotel
from .models import Room

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = "__all__"

class RoomSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Room
        fields = [
            'id',
            'hotel',
            'hotel_name',
            'room_name',
            'room_type',
            'bed_type',
            'size_in_sqft',
            'price_per_night',
            'max_guests',
            'total_rooms',
            'available_rooms',
            'amenities',
            'is_refundable',
            'free_cancellation',
            'description',
            'is_available',
            'created_at',
        ]
