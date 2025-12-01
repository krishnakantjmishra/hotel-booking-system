from django.urls import path
from .views import BookingListCreateView, BookingDetailView

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]
