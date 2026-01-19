"""
Serializer for bulk room inventory operations.
"""
from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Room, RoomInventory


class BulkInventorySerializer(serializers.Serializer):
    """
    Serializer for creating/updating inventory for a date range.
    """
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_rooms = serializers.IntegerField(min_value=0)
    
    def validate(self, data):
        """Validate that end_date is not before start_date."""
        from datetime import date as date_class
        today = date_class.today()
        
        # Prevent past dates
        if data['start_date'] < today:
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be in the past.'
            })
        
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date.'
            })
        
        # Limit to reasonable range (max 14 days)
        date_diff = (data['end_date'] - data['start_date']).days
        if date_diff > 14:
            raise serializers.ValidationError({
                'end_date': 'Date range cannot exceed 14 days.'
            })
        
        return data
    
    def create_bulk_inventory(self):
        """
        Create or update inventory entries for all dates in the range.
        Returns a dict with created/updated counts.
        """
        room = self.validated_data['room']
        start_date = self.validated_data['start_date']
        end_date = self.validated_data['end_date']
        total_rooms = self.validated_data['total_rooms']
        
        created_count = 0
        updated_count = 0
        
        # Generate all dates in range (inclusive)
        current_date = start_date
        while current_date <= end_date:
            inventory, created = RoomInventory.objects.update_or_create(
                room=room,
                date=current_date,
                defaults={'total_rooms': total_rooms}
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
            
            current_date += timedelta(days=1)
        
        return {
            'created': created_count,
            'updated': updated_count,
            'total': created_count + updated_count,
            'room': room.room_name,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }
