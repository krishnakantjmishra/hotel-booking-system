from rest_framework import serializers
from .models import Booking, OTPRequest, EmailSession
from hotels.models import Room
from datetime import timedelta


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    package_name = serializers.CharField(source='package.name', read_only=True)

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
            'package',
            'package_name',
            'check_in',
            'check_out',
            'num_adults',
            'num_children',
            'total_price',
            'status',
            'created_at'
        ]
        read_only_fields = ['hotel', 'hotel_name', 'room_name', 'package_name', 'total_price']

    def validate(self, data):
        check_in = data['check_in']
        check_out = data['check_out']

        if check_in >= check_out:
            raise serializers.ValidationError("Check-out must be after check-in")

        return data

    def create(self, validated_data):
        room = validated_data['room']
        hotel = room.hotel
        check_in = validated_data['check_in']
        check_out = validated_data['check_out']

        # Price calculation
        nights = (check_out - check_in).days
        total_price = (room.price_per_night or 0) * nights

        from django.db import transaction
        from hotels.models import RoomInventory
        from datetime import timedelta

        with transaction.atomic():
            # Create the booking
            package_obj = validated_data.get('package')
            if package_obj:
                 # If package is selected, use package final_price
                 # Note: Package model has 'final_price' property, but we can't access property in create easily if it's not in validated_data
                 # We need to fetch it from the object.
                 # Actually validated_data['package'] is the Package instance.
                 total_price = package_obj.final_price
            
            booking = Booking.objects.create(
                hotel=hotel,
                room=room,
                package=package_obj,
                user_name=validated_data.get('user_name'),
                user_email=validated_data.get('user_email'),
                user_phone=validated_data.get('user_phone', None),
                check_in=check_in,
                check_out=check_out,
                num_adults=validated_data.get('num_adults', 1),
                num_children=validated_data.get('num_children', 0),
                total_price=total_price,
                status=validated_data.get('status', 'confirmed')
            )

            # If confirmed, increment inventory
            if booking.status == 'confirmed':
                curr = check_in
                while curr < check_out:
                    inv, _ = RoomInventory.objects.select_for_update().get_or_create(
                        room=room, 
                        date=curr,
                        defaults={'total_rooms': room.total_rooms}
                    )
                    inv.booked_rooms += 1
                    inv.save()
                    curr += timedelta(days=1)
            
            return booking


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class EmailSessionSerializer(serializers.Serializer):
    token = serializers.CharField()
    expires_at = serializers.DateTimeField()
