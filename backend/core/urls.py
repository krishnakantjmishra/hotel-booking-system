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
from django.views.generic import RedirectView

# Normalize legacy or double-prefixed API paths to canonical endpoints.
# Examples handled here:
# - /v1/...        -> /api/v1/...
# - /api/admin-api/... -> /admin-api/...
# - /api/api/...   -> /api/...
urlpatterns = [
    # Redirect /v1/* -> /api/v1/* (legacy clients)
    path('v1/<path:rest>', RedirectView.as_view(url='/api/v1/%(rest)s', permanent=False)),
    path('v1', RedirectView.as_view(url='/api/v1/', permanent=False)),
    # Redirect /api/admin-api/* -> /admin-api/* (accidental '/api' prefix)
    path('api/admin-api/<path:rest>', RedirectView.as_view(url='/admin-api/%(rest)s', permanent=False)),
    path('api/admin-api', RedirectView.as_view(url='/admin-api/', permanent=False)),
    # Collapse double /api/api/* -> /api/*
    path('api/api/<path:rest>', RedirectView.as_view(url='/api/%(rest)s', permanent=False)),
    
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),   # canonical API prefix
    # TEMP: Provide backward-compatible alias (trimmed API prefix) so older clients
    # that still post to /v1/auth/token/ continue to work until clients are updated.
    path('v1/auth/', include('users.urls')),
    path('v1/auth', include('users.urls')),

    # other includes (e.g. hotels/products) later
    # Handle both with and without trailing slash for better API compatibility
    path('api/v1/hotels/', include('hotels.urls')),
    path('api/v1/hotels', include('hotels.urls')),
    path('api/v1/bookings/', include('bookings.urls')),
    path('api/v1/bookings', include('bookings.urls')),
    
    # Admin API endpoints (mounted at top-level admin-api/)
    path('admin-api/', include('hotels.admin_urls')),
    path('admin-api', include('hotels.admin_urls')),

]