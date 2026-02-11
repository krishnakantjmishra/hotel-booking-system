"""
API views for Hotel and Room image uploads.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from .models import Hotel, Room
from .image_models import HotelImage, RoomImage
from .image_serializers import (
    HotelImageSerializer, 
    RoomImageSerializer,
    HotelImageUploadSerializer,
    RoomImageUploadSerializer
)


class HotelImageListView(APIView):
    """List all images for a hotel."""
    permission_classes = []  # Public access for viewing

    def get(self, request, hotel_id):
        hotel = get_object_or_404(Hotel, id=hotel_id)
        images = HotelImage.objects.filter(hotel=hotel)
        serializer = HotelImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data)


class HotelImageUploadView(APIView):
    """Upload images for a hotel."""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, hotel_id):
        hotel = get_object_or_404(Hotel, id=hotel_id)
        
        # Check max images limit
        existing_count = HotelImage.objects.filter(hotel=hotel).count()
        if existing_count >= 10:
            return Response(
                {'error': 'Maximum 10 images allowed per hotel.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = HotelImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            try:
                image_obj = HotelImage.objects.create(
                    hotel=hotel,
                    image=serializer.validated_data['image'],
                    alt_text=serializer.validated_data.get('alt_text', ''),
                    is_primary=serializer.validated_data.get('is_primary', False),
                    order=serializer.validated_data.get('order', 0)
                )
                response_serializer = HotelImageSerializer(image_obj, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                import logging
                import traceback
                logger = logging.getLogger(__name__)
                logger.error(f"Error uploading hotel image: {str(e)}")
                logger.error(traceback.format_exc())
                return Response(
                    {'error': f'Upload failed: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HotelImageDeleteView(APIView):
    """Delete a specific hotel image."""
    permission_classes = [IsAdminUser]

    def delete(self, request, hotel_id, image_id):
        hotel = get_object_or_404(Hotel, id=hotel_id)
        image = get_object_or_404(HotelImage, id=image_id, hotel=hotel)
        
        # Delete the file from storage
        if image.image:
            image.image.delete(save=False)
        
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoomImageListView(APIView):
    """List all images for a room."""
    permission_classes = []  # Public access for viewing

    def get(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        images = RoomImage.objects.filter(room=room)
        serializer = RoomImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data)


class RoomImageUploadView(APIView):
    """Upload images for a room."""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)
        
        # Check max images limit
        existing_count = RoomImage.objects.filter(room=room).count()
        if existing_count >= 10:
            return Response(
                {'error': 'Maximum 10 images allowed per room.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RoomImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            try:
                image_obj = RoomImage.objects.create(
                    room=room,
                    image=serializer.validated_data['image'],
                    alt_text=serializer.validated_data.get('alt_text', ''),
                    is_primary=serializer.validated_data.get('is_primary', False),
                    order=serializer.validated_data.get('order', 0)
                )
                response_serializer = RoomImageSerializer(image_obj, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                import logging
                import traceback
                logger = logging.getLogger(__name__)
                logger.error(f"Error uploading room image: {str(e)}")
                logger.error(traceback.format_exc())
                return Response(
                    {'error': f'Upload failed: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomImageDeleteView(APIView):
    """Delete a specific room image."""
    permission_classes = [IsAdminUser]

    def delete(self, request, room_id, image_id):
        room = get_object_or_404(Room, id=room_id)
        image = get_object_or_404(RoomImage, id=image_id, room=room)
        
        # Delete the file from storage
        if image.image:
            image.image.delete(save=False)
        
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
