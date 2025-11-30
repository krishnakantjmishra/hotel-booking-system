from django.urls import path
from .views import HotelListCreateView, HotelDetailView,RoomListCreateView, RoomDetailView

urlpatterns = [
    path('', HotelListCreateView.as_view(), name='hotels'),
    path('<int:pk>/', HotelDetailView.as_view(), name='hotel-detail'),
    path('<int:pk>', HotelDetailView.as_view(), name='hotel-detail-no-slash'),
    # Rooms
    path('<int:hotel_id>/rooms/', RoomListCreateView.as_view(), name='hotel-rooms'),
    path('<int:hotel_id>/rooms', RoomListCreateView.as_view(), name='hotel-rooms-no-slash'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('rooms/<int:pk>', RoomDetailView.as_view(), name='room-detail-no-slash'),
]
