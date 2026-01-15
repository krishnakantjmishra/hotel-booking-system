from django.urls import path
from .views import HotelListCreateView, HotelDetailView, RoomListCreateView, RoomDetailView
from .image_views import (
    HotelImageListView,
    HotelImageUploadView,
    HotelImageDeleteView,
    RoomImageListView,
    RoomImageUploadView,
    RoomImageDeleteView,
)

urlpatterns = [
    # Public/User endpoints
    path('', HotelListCreateView.as_view(), name='hotels'),
    path('<int:pk>/', HotelDetailView.as_view(), name='hotel-detail'),
    path('<int:pk>', HotelDetailView.as_view(), name='hotel-detail-no-slash'),
    # Rooms
    path('<int:hotel_id>/rooms/', RoomListCreateView.as_view(), name='hotel-rooms'),
    path('<int:hotel_id>/rooms', RoomListCreateView.as_view(), name='hotel-rooms-no-slash'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('rooms/<int:pk>', RoomDetailView.as_view(), name='room-detail-no-slash'),
    
    # Hotel Images (public list, admin upload/delete)
    path('<int:hotel_id>/images/', HotelImageListView.as_view(), name='hotel-images'),
    path('<int:hotel_id>/images/upload/', HotelImageUploadView.as_view(), name='hotel-image-upload'),
    path('<int:hotel_id>/images/<int:image_id>/', HotelImageDeleteView.as_view(), name='hotel-image-delete'),
    
    # Room Images (public list, admin upload/delete)
    path('rooms/<int:room_id>/images/', RoomImageListView.as_view(), name='room-images'),
    path('rooms/<int:room_id>/images/upload/', RoomImageUploadView.as_view(), name='room-image-upload'),
    path('rooms/<int:room_id>/images/<int:image_id>/', RoomImageDeleteView.as_view(), name='room-image-delete'),
]

