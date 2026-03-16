from django.urls import path
from .views import (
    TripCreateView,
    TripListView,
    TripDetailView,
    DriverTripsView,
    BookingCreateView,
    BookingListView,
    BookingDetailView,
    CancelBookingView,
    ConfirmBookingView,
    DriverBookingsView,
    MarkNoShowView,
    StartTripView,
    CompleteTripView,
    TripMessagesView,
    TripTrackingView,
)

app_name = 'trips'

urlpatterns = [
    # Trips
    path('', TripListView.as_view(), name='list'),
    path('create/', TripCreateView.as_view(), name='create'),
    path('<int:pk>/', TripDetailView.as_view(), name='detail'),
    path('driver/trips/', DriverTripsView.as_view(), name='driver_trips'),
    path('<int:pk>/start/', StartTripView.as_view(), name='start_trip'),
    path('<int:pk>/complete/', CompleteTripView.as_view(), name='complete_trip'),
    
    # Bookings
    path('bookings/', BookingListView.as_view(), name='bookings'),
    path('bookings/create/', BookingCreateView.as_view(), name='create_booking'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('bookings/<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel_booking'),
    path('bookings/<int:pk>/confirm/', ConfirmBookingView.as_view(), name='confirm_booking'),
    path('bookings/<int:pk>/no-show/', MarkNoShowView.as_view(), name='mark_no_show'),
    path('driver/bookings/', DriverBookingsView.as_view(), name='driver_bookings'),
    
    # Trip Messages
    path('<int:trip_id>/messages/', TripMessagesView.as_view(), name='trip_messages'),
    
    # Trip Tracking
    path('<int:trip_id>/tracking/', TripTrackingView.as_view(), name='trip_tracking'),
]
