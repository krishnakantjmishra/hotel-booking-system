from rest_framework import serializers
from .models import Hotel, Room, RoomInventory, Package
from .image_serializers import HotelImageSerializer, RoomImageSerializer

class HotelSerializer(serializers.ModelSerializer):
    images = HotelImageSerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'city', 'address', 'rating', 
            'price_min', 'description', 'created_at', 'images'
        ]

class RoomSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    images = RoomImageSerializer(many=True, read_only=True)

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
            'images',
        ]


class RoomInventorySerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    hotel_name = serializers.CharField(source='room.hotel.name', read_only=True)
    available_rooms = serializers.IntegerField(read_only=True)

    class Meta:
        model = RoomInventory
        fields = [
            'id',
            'room',
            'room_name',
            'hotel_name',
            'date',
            'total_rooms',
            'booked_rooms',
            'available_rooms',
        ]


class PackageSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Package
        fields = [
            'id',
            'name',
            'hotel',
            'hotel_name',
            'description',
            'price',
            'discount_percentage',
            'final_price',
            'duration_nights',
            'includes_meals',
            'includes_activities',
            'amenities',
            'is_active',
            'valid_from',
            'valid_until',
            'created_at',
            'updated_at',
        ]
