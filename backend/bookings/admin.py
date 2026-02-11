from django.contrib import admin
from .models import Booking, OTPRequest, EmailSession


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'user_name', 'hotel', 'room', 'status', 'created_at')
    search_fields = ('user_email', 'user_name')
    list_filter = ('status', 'hotel')


@admin.register(OTPRequest)
class OTPRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'created_at', 'expires_at', 'used')
    search_fields = ('email',)
    readonly_fields = ('otp_hash',)


@admin.register(EmailSession)
class EmailSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'token', 'email', 'created_at', 'expires_at', 'valid')
    search_fields = ('email', 'token')
    list_filter = ('valid',)

