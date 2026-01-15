from django.contrib import admin
from .models import Hotel, Room, RoomInventory, Package

# Register your models here.

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'rating', 'price_min', 'created_at']
    list_filter = ['city', 'rating', 'created_at']
    search_fields = ['name', 'city', 'address']

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_name', 'hotel', 'room_type', 'price_per_night', 'total_rooms', 'available_rooms', 'is_available']
    list_filter = ['room_type', 'bed_type', 'is_available', 'hotel']
    search_fields = ['room_name', 'hotel__name']

@admin.register(RoomInventory)
class RoomInventoryAdmin(admin.ModelAdmin):
    list_display = ['room', 'date', 'total_rooms', 'booked_rooms', 'available_rooms']
    list_filter = ['date', 'room__hotel', 'room__room_type']
    search_fields = ['room__room_name', 'room__hotel__name']
    date_hierarchy = 'date'
    readonly_fields = ('available_rooms',)

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'hotel', 'price', 'discount_percentage', 'final_price', 'duration_nights', 'is_active', 'created_at']
    list_filter = ['is_active', 'includes_meals', 'includes_activities', 'hotel', 'created_at']
    search_fields = ['name', 'hotel__name', 'description']
    readonly_fields = ['final_price', 'created_at', 'updated_at']
