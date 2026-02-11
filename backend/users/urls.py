from django.urls import path
from .views import ProfileView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Registration removed: normal users should not create accounts.
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),

]
