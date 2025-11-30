from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.settings import api_settings
from django.db.models import Q

from .models import Hotel
from .serializers import HotelSerializer


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
