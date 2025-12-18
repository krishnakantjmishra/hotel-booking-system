from django.urls import path
from .admin_views import (
    AdminHotelListCreateView,
    AdminHotelDetailView,
    AdminRoomListCreateView,
    AdminRoomDetailView,
    AdminPackageListCreateView,
    AdminPackageDetailView,
    AdminRoomInventoryListCreateView,
    AdminRoomInventoryDetailView,
)

urlpatterns = [
    # Hotels Admin CRUD
    path('hotels/', AdminHotelListCreateView.as_view(), name='admin-hotels'),
    path('hotels/<int:pk>/', AdminHotelDetailView.as_view(), name='admin-hotel-detail'),
    path('hotels/<int:pk>', AdminHotelDetailView.as_view(), name='admin-hotel-detail-no-slash'),
    
    # Rooms Admin CRUD
    path('rooms/', AdminRoomListCreateView.as_view(), name='admin-rooms'),
    path('rooms/<int:pk>/', AdminRoomDetailView.as_view(), name='admin-room-detail'),
    path('rooms/<int:pk>', AdminRoomDetailView.as_view(), name='admin-room-detail-no-slash'),
    
    # Packages Admin CRUD
    path('packages/', AdminPackageListCreateView.as_view(), name='admin-packages'),
    path('packages/<int:pk>/', AdminPackageDetailView.as_view(), name='admin-package-detail'),
    path('packages/<int:pk>', AdminPackageDetailView.as_view(), name='admin-package-detail-no-slash'),
    
    # Room Inventory Admin CRUD
    path('inventory/', AdminRoomInventoryListCreateView.as_view(), name='admin-inventory'),
    path('inventory/<int:pk>/', AdminRoomInventoryDetailView.as_view(), name='admin-inventory-detail'),
    path('inventory/<int:pk>', AdminRoomInventoryDetailView.as_view(), name='admin-inventory-detail-no-slash'),
]

