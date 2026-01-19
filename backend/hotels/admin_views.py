from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from rest_framework.settings import api_settings
from django.db.models import Q

from .models import Hotel, Room, RoomInventory, Package
from .serializers import (
    HotelSerializer, 
    RoomSerializer, 
    RoomInventorySerializer, 
    PackageSerializer
)
from .bulk_inventory_serializer import BulkInventorySerializer


# ==================== HOTELS ADMIN CRUD ====================

class AdminHotelListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """List all hotels"""
        hotels = Hotel.objects.all()
        
        # Search
        search = request.GET.get("search")
        if search:
            hotels = hotels.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search) |
                Q(address__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get("ordering", "-created_at")
        hotels = hotels.order_by(ordering)
        
        # Pagination
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_hotels = paginator.paginate_queryset(hotels, request)
        serializer = HotelSerializer(paginated_hotels, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new hotel"""
        serializer = HotelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminHotelDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        """Get hotel details"""
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update hotel (full update)"""
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HotelSerializer(hotel, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Update hotel (partial update)"""
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HotelSerializer(hotel, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete hotel"""
        try:
            hotel = Hotel.objects.get(pk=pk)
        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)
        
        hotel.delete()
        return Response({"message": "Hotel deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ==================== ROOMS ADMIN CRUD ====================

class AdminRoomListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """List all rooms"""
        rooms = Room.objects.select_related('hotel').all()
        
        # Filters
        hotel_id = request.GET.get("hotel_id")
        room_type = request.GET.get("room_type")
        is_available = request.GET.get("is_available")
        
        if hotel_id:
            rooms = rooms.filter(hotel_id=hotel_id)
        if room_type:
            rooms = rooms.filter(room_type=room_type)
        if is_available is not None:
            rooms = rooms.filter(is_available=is_available.lower() == 'true')
        
        # Search
        search = request.GET.get("search")
        if search:
            rooms = rooms.filter(
                Q(room_name__icontains=search) |
                Q(hotel__name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get("ordering", "-created_at")
        rooms = rooms.order_by(ordering)
        
        # Pagination
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_rooms = paginator.paginate_queryset(rooms, request)
        serializer = RoomSerializer(paginated_rooms, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new room"""
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminRoomDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        """Get room details"""
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update room (full update)"""
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Update room (partial update)"""
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete room"""
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        
        room.delete()
        return Response({"message": "Room deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ==================== PACKAGES ADMIN CRUD ====================

class AdminPackageListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """List all packages"""
        packages = Package.objects.select_related('hotel').all()
        
        # Filters
        hotel_id = request.GET.get("hotel_id")
        is_active = request.GET.get("is_active")
        
        if hotel_id:
            packages = packages.filter(hotel_id=hotel_id)
        if is_active is not None:
            packages = packages.filter(is_active=is_active.lower() == 'true')
        
        # Search
        search = request.GET.get("search")
        if search:
            packages = packages.filter(
                Q(name__icontains=search) |
                Q(hotel__name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Ordering
        ordering = request.GET.get("ordering", "-created_at")
        packages = packages.order_by(ordering)
        
        # Pagination
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_packages = paginator.paginate_queryset(packages, request)
        serializer = PackageSerializer(paginated_packages, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new package"""
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPackageDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        """Get package details"""
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PackageSerializer(package)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update package (full update)"""
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PackageSerializer(package, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Update package (partial update)"""
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PackageSerializer(package, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete package"""
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
        
        package.delete()
        return Response({"message": "Package deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ==================== ROOM INVENTORY ADMIN CRUD ====================

class AdminRoomInventoryListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """List all room inventories"""
        inventories = RoomInventory.objects.select_related('room', 'room__hotel').all()
        
        # Filters
        room_id = request.GET.get("room_id")
        hotel_id = request.GET.get("hotel_id")
        date_from = request.GET.get("date_from")
        date_to = request.GET.get("date_to")
        
        if room_id:
            inventories = inventories.filter(room_id=room_id)
        if hotel_id:
            inventories = inventories.filter(room__hotel_id=hotel_id)
        if date_from:
            inventories = inventories.filter(date__gte=date_from)
        if date_to:
            inventories = inventories.filter(date__lte=date_to)
        
        # Ordering
        ordering = request.GET.get("ordering", "date")
        inventories = inventories.order_by(ordering)
        
        # Pagination
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        paginated_inventories = paginator.paginate_queryset(inventories, request)
        serializer = RoomInventorySerializer(paginated_inventories, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        """Create a new room inventory entry"""
        serializer = RoomInventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminRoomInventoryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        """Get room inventory details"""
        try:
            inventory = RoomInventory.objects.get(pk=pk)
        except RoomInventory.DoesNotExist:
            return Response({"error": "Room inventory not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomInventorySerializer(inventory)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update room inventory (full update)"""
        try:
            inventory = RoomInventory.objects.get(pk=pk)
        except RoomInventory.DoesNotExist:
            return Response({"error": "Room inventory not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomInventorySerializer(inventory, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Update room inventory (partial update)"""
        try:
            inventory = RoomInventory.objects.get(pk=pk)
        except RoomInventory.DoesNotExist:
            return Response({"error": "Room inventory not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoomInventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete room inventory"""
        try:
            inventory = RoomInventory.objects.get(pk=pk)
        except RoomInventory.DoesNotExist:
            return Response({"error": "Room inventory not found"}, status=status.HTTP_404_NOT_FOUND)
        

        inventory.delete()
        return Response({"message": "Room inventory deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# ==================== BULK INVENTORY OPERATIONS ====================

class AdminBulkInventoryCreateView(APIView):
    """
    Create or update inventory for a date range.
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """
        Create/update inventory for multiple dates.
        
        Expected payload:
        {
            "room": 1,
            "start_date": "2026-01-20",
            "end_date": "2026-01-30",
            "total_rooms": 10
        }
        """
        serializer = BulkInventorySerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                result = serializer.create_bulk_inventory()
                return Response({
                    "message": "Bulk inventory created/updated successfully",
                    **result
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "error": f"Failed to create bulk inventory: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
