from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import datetime as _dt
from django.utils.dateparse import parse_date, parse_datetime
import logging

logger = logging.getLogger(__name__)

from .models import Booking
from .serializers import BookingSerializer
from hotels.models import Room, RoomInventory


def get_dates_in_range(check_in, check_out):
    """Generate all dates between check_in and check_out (excluding check_out)."""
    # Normalize inputs to date objects
    def normalize(val):
        if isinstance(val, _dt.date) and not isinstance(val, _dt.datetime):
            return val
        if isinstance(val, _dt.datetime):
            return val.date()
        if isinstance(val, str):
            parsed = parse_date(val)
            if parsed:
                return parsed
            parsed_dt = parse_datetime(val)
            if parsed_dt:
                return parsed_dt.date()
            logger.debug("normalize_date failed for value=%r type=%r", val, type(val))
            return None

    check_in = normalize(check_in)
    check_out = normalize(check_out)
    if not check_in or not check_out:
        return []
    dates = []
    # ensure caller passes date objects
    current_date = check_in
    while current_date < check_out:
        dates.append(current_date)
        current_date += _dt.timedelta(days=1)
    return dates

class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all bookings for the authenticated user"""
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id

        # Validate room
        try:
            room = Room.objects.select_for_update().get(id=data['room'])
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)

        # Validate dates - coerce strings to date objects if necessary
        def normalize_date(val):
            if isinstance(val, _dt.datetime):
                return val.date()
            if isinstance(val, _dt.date):
                return val
            if isinstance(val, str):
                parsed = parse_date(val)
                if parsed:
                    return parsed
                parsed_dt = parse_datetime(val)
                if parsed_dt:
                    return parsed_dt.date()
            return None

        check_in = normalize_date(data.get('check_in'))
        check_out = normalize_date(data.get('check_out'))

        if not check_in or not check_out:
            return Response({"error": "check_in and check_out dates are required or in wrong format"}, status=400)

        if check_in >= check_out:
            return Response({"error": "Check-out must be after check-in"}, status=400)

        # Get all dates in the booking range (excluding check_out date)
        dates_in_range = get_dates_in_range(check_in, check_out)

        # Prepare inventory entries - check availability and lock rows
        inventory_entries = []
        for date in dates_in_range:
            # Get or create RoomInventory entry for this date (with lock)
            inventory, created = RoomInventory.objects.select_for_update().get_or_create(
                room=room,
                date=date,
                defaults={'total_rooms': room.total_rooms, 'booked_rooms': 0}
            )
            
            # If inventory already exists but total_rooms doesn't match room.total_rooms, update it
            if not created and inventory.total_rooms != room.total_rooms:
                inventory.total_rooms = room.total_rooms
                inventory.save()
            
            # Check if there's availability (booked_rooms < total_rooms)
            if inventory.booked_rooms >= inventory.total_rooms:
                return Response(
                    {
                        "error": f"Room is fully booked on {date.strftime('%Y-%m-%d')}. "
                                f"Available: {inventory.available_rooms}/{inventory.total_rooms}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            inventory_entries.append(inventory)

        # Validate booking data
        serializer = BookingSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # All dates are available and booking data is valid
        # Create the booking first
        booking = serializer.save(hotel=room.hotel, user=request.user)
        
        # Then increment booked_rooms for each date (already locked from above)
        for inventory in inventory_entries:
            inventory.booked_rooms += 1
            inventory.save()
        
        return Response(BookingSerializer(booking).data, status=201)
    
class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        return Response(BookingSerializer(booking).data)

    @transaction.atomic
    def delete(self, request, pk):
        try:
            booking = Booking.objects.select_for_update().get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        # Only decrement inventory if booking was confirmed (not already cancelled)
        if booking.status == 'confirmed':
            # Get all dates in the booking range
            dates_in_range = get_dates_in_range(booking.check_in, booking.check_out)
            
            # Decrement booked_rooms for each date
            for date in dates_in_range:
                try:
                    inventory = RoomInventory.objects.select_for_update().get(
                        room=booking.room,
                        date=date
                    )
                    # Decrement booked_rooms, but don't let it go below 0
                    if inventory.booked_rooms > 0:
                        inventory.booked_rooms -= 1
                        inventory.save()
                except RoomInventory.DoesNotExist:
                    # If inventory doesn't exist, that's okay (might have been deleted)
                    pass

        booking.status = "cancelled"
        booking.save()

        return Response({"message": "Booking cancelled successfully"})
