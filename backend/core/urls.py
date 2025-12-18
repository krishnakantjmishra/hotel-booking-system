"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# existing swagger code, if any
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),   # <-- add this line
    # other includes (e.g. hotels/products) later
    # Handle both with and without trailing slash for better API compatibility
    path('api/v1/hotels/', include('hotels.urls')),
    path('api/v1/hotels', include('hotels.urls')),
    path('api/v1/bookings/', include('bookings.urls')),
    path('api/v1/bookings', include('bookings.urls')),
    
    # Admin API endpoints
    path('admin-api/', include('hotels.admin_urls')),
    path('admin-api', include('hotels.admin_urls')),

]