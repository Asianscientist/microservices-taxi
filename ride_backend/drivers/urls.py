from django.urls import path
from .views import (
    DriverProfileCreateView,
    DriverProfileDetailView,
    DriverListView,
    DriverDetailPublicView,
    DriverVerificationView,
    PendingDriverVerificationsView,
    RouteListCreateView,
    RouteDetailView,
    DriverAvailabilityView,
    DriverDocumentView,
    DriverStatsView,
    ToggleDriverAvailabilityView,
)

app_name = 'drivers'

urlpatterns = [
    # Driver Profile
    path('profile/create/', DriverProfileCreateView.as_view(), name='create_profile'),
    path('profile/', DriverProfileDetailView.as_view(), name='profile'),
    path('profile/stats/', DriverStatsView.as_view(), name='stats'),
    path('profile/toggle-availability/', ToggleDriverAvailabilityView.as_view(), name='toggle_availability'),
    
    # Public Driver Views
    path('', DriverListView.as_view(), name='list'),
    path('<int:pk>/', DriverDetailPublicView.as_view(), name='detail'),
    
    # Admin - Driver Verification
    path('<int:pk>/verify/', DriverVerificationView.as_view(), name='verify'),
    path('pending-verifications/', PendingDriverVerificationsView.as_view(), name='pending_verifications'),
    
    # Routes
    path('routes/', RouteListCreateView.as_view(), name='routes'),
    path('routes/<int:pk>/', RouteDetailView.as_view(), name='route_detail'),
    
    # Driver Availability
    path('availability/', DriverAvailabilityView.as_view(), name='availability'),
    
    # Driver Documents
    path('documents/', DriverDocumentView.as_view(), name='documents'),
]
