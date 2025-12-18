from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.settings import api_settings
from django.db.models import Q

from .models import Hotel, Room
from .serializers import HotelSerializer, RoomSerializer


class HotelListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hotels = Hotel.objects.all()

        # ---------- FILTERS ----------
        city = request.GET.get("city")
        rating_min = request.GET.get("rating_min")
        rating_max = request.GET.get("rating_max")

        if city:
            hotels = hotels.filter(city__icontains=city)

        if rating_min:
            hotels = hotels.filter(rating__gte=rating_min)

        if rating_max:
            hotels = hotels.filter(rating__lte=rating_max)

        # ---------- SEARCH ----------
        search = request.GET.get("search")
        if search:
            hotels = hotels.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search)
            )

        # ---------- ORDERING ----------
        # Examples: ?ordering=rating or ?ordering=-created_at
        ordering = request.GET.get("ordering")
        if ordering:
            hotels = hotels.order_by(ordering)

        # ---------- PAGINATION ----------
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_hotels = paginator.paginate_queryset(hotels, request)
        serializer = HotelSerializer(paginated_hotels, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class HotelDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=404)

        serializer = HotelSerializer(hotel)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=404)

        serializer = HotelSerializer(hotel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=404)

        hotel.delete()
        return Response({"message": "Hotel deleted"})



class RoomListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, hotel_id):
        rooms = Room.objects.filter(hotel_id=hotel_id)

        # ------- Filters --------
        room_type = request.GET.get("room_type")
        price_min = request.GET.get("price_min")
        price_max = request.GET.get("price_max")
        max_guests = request.GET.get("max_guests")

        if room_type:
            rooms = rooms.filter(room_type=room_type)

        if price_min:
            rooms = rooms.filter(price_per_night__gte=price_min)

        if price_max:
            rooms = rooms.filter(price_per_night__lte=price_max)

        if max_guests:
            rooms = rooms.filter(max_guests__gte=max_guests)

        # -------- Pagination --------
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_rooms = paginator.paginate_queryset(rooms, request)
        serializer = RoomSerializer(paginated_rooms, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, hotel_id):
        # attach hotel inside request
        data = request.data.copy()
        data['hotel'] = hotel_id

        serializer = RoomSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return None

    def get(self, request, pk):
        room = self.get_object(pk)
        if not room:
            return Response({"error": "Room not found"}, status=404)
        return Response(RoomSerializer(room).data)

    def put(self, request, pk):
        room = self.get_object(pk)
        if not room:
            return Response({"error": "Room not found"}, status=404)

        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        room = self.get_object(pk)
        if not room:
            return Response({"error": "Room not found"}, status=404)
        room.delete()
        return Response({"message": "Room deleted"})
