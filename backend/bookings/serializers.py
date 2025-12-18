from rest_framework import serializers
from .models import Booking
from hotels.models import Room
from datetime import timedelta

class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'hotel',
            'hotel_name',
            'room',
            'room_name',
            'check_in',
            'check_out',
            'total_price',
            'status',
            'created_at'
        ]
        read_only_fields = ['user', 'hotel', 'hotel_name', 'room_name', 'total_price']

    def validate(self, data):
        check_in = data['check_in']
        check_out = data['check_out']

        if check_in >= check_out:
            raise serializers.ValidationError("Check-out must be after check-in")

        return data

    def save(self, **kwargs):
        # Store hotel and user from kwargs if provided
        self._hotel = kwargs.pop('hotel', None)
        self._user = kwargs.pop('user', None)
        return super().save(**kwargs)

    def create(self, validated_data):
        room = validated_data['room']
        
        # Get hotel from _hotel (passed from view via save()) or from room
        hotel = self._hotel if hasattr(self, '_hotel') and self._hotel else room.hotel
        
        # Get user from _user (passed from view via save()) or from context
        if hasattr(self, '_user') and self._user:
            user = self._user
        elif 'request' in self.context:
            user = self.context['request'].user
        else:
            raise serializers.ValidationError("User is required for booking creation")

        # Price calculation
        nights = (validated_data['check_out'] - validated_data['check_in']).days
        total_price = room.price_per_night * nights

        return Booking.objects.create(
            hotel=hotel,
            room=room,
            user=user,
            check_in=validated_data['check_in'],
            check_out=validated_data['check_out'],
            total_price=total_price,
            status=validated_data.get('status', 'confirmed')
        )
