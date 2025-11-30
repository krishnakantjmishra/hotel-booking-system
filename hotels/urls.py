from django.urls import path
from .views import HotelListCreateView, HotelDetailView

urlpatterns = [
    path('', HotelListCreateView.as_view(), name='hotels'),
    path('<int:pk>/', HotelDetailView.as_view(), name='hotel-detail'),
    path('<int:pk>', HotelDetailView.as_view(), name='hotel-detail-no-slash'),
]
