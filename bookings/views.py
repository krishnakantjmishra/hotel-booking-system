from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Q

from .models import Booking
from .serializers import BookingSerializer
from hotels.models import Room

class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id

        # Step 1: Validate room exists
        try:
            room = Room.objects.select_for_update().get(id=data['room'])
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)
        except (KeyError, ValueError) as e:
            return Response({"error": "Invalid room ID"}, status=400)

        # Step 2: Check if room has overlapping bookings
        try:
            check_in = data['check_in']
            check_out = data['check_out']
        except KeyError as e:
            return Response({"error": f"Missing required field: {str(e)}"}, status=400)

        overlapping = Booking.objects.filter(
            room=room,
            status="confirmed"
        ).filter(
            Q(check_in__lt=check_out) & Q(check_out__gt=check_in)
        )

        if overlapping.exists():
            return Response({"error": "Room already booked for selected dates"}, status=400)

        serializer = BookingSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            try:
                booking = serializer.save(hotel=room.hotel, user=request.user)
                return Response(BookingSerializer(booking).data, status=201)
            except Exception as e:
                return Response({"error": str(e)}, status=500)

        return Response(serializer.errors, status=400)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        return Response(BookingSerializer(booking).data)

    def delete(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        booking.status = "cancelled"
        booking.save()

        return Response({"message": "Booking cancelled successfully"})
