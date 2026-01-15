from rest_framework import serializers
from .models import Booking, OTPRequest, EmailSession
from hotels.models import Room
from datetime import timedelta


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user_name',
            'user_email',
            'user_phone',
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
        read_only_fields = ['hotel', 'hotel_name', 'room_name', 'total_price']

    def validate(self, data):
        check_in = data['check_in']
        check_out = data['check_out']

        if check_in >= check_out:
            raise serializers.ValidationError("Check-out must be after check-in")

        return data

    def create(self, validated_data):
        room = validated_data['room']

        # Get hotel from room
        hotel = room.hotel

        # Price calculation
        nights = (validated_data['check_out'] - validated_data['check_in']).days
        total_price = (room.price_per_night or 0) * nights

        return Booking.objects.create(
            hotel=hotel,
            room=room,
            user_name=validated_data.get('user_name'),
            user_email=validated_data.get('user_email'),
            user_phone=validated_data.get('user_phone', None),
            check_in=validated_data['check_in'],
            check_out=validated_data['check_out'],
            total_price=total_price,
            status=validated_data.get('status', 'confirmed')
        )


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class EmailSessionSerializer(serializers.Serializer):
    token = serializers.CharField()
    expires_at = serializers.DateTimeField()
