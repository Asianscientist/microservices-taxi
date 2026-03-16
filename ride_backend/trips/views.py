from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import Trip, Booking, TripMessage, TripTracking
from .serializers import (
    TripSerializer,
    TripListSerializer,
    BookingSerializer,
    BookingListSerializer,
    CancelBookingSerializer,
    TripMessageSerializer,
    TripTrackingSerializer
)
from drivers.permissions import IsDriver


class TripCreateView(generics.CreateAPIView):
    """Create a new trip (driver only)"""
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def perform_create(self, serializer):
        driver = self.request.user.driver_profile
        
        # Check if driver can accept trips
        if not driver.can_accept_trips():
            raise serializers.ValidationError('Driver is not authorized to create trips')
        
        serializer.save()


class TripListView(generics.ListAPIView):
    """List all available trips"""
    queryset = Trip.objects.filter(
        status__in=['pending', 'confirmed'],
        is_active=True,
        departure_datetime__gte=timezone.now()
    )
    serializer_class = TripListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['from_city', 'to_city', 'status']
    search_fields = ['from_city', 'to_city']
    ordering_fields = ['departure_datetime', 'price_per_seat']
    ordering = ['departure_datetime']


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a trip"""
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsDriver()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        # Only allow driver who created the trip to update
        if serializer.instance.driver.user != self.request.user:
            raise PermissionError('You do not have permission to update this trip')
        serializer.save()

    def perform_destroy(self, instance):
        # Only allow cancellation, not deletion
        if instance.driver.user != self.request.user:
            raise PermissionError('You do not have permission to cancel this trip')
        instance.cancel_trip(cancelled_by='driver', reason='Cancelled by driver')


class DriverTripsView(generics.ListAPIView):
    """List trips for the authenticated driver"""
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return Trip.objects.filter(driver=self.request.user.driver_profile)


class BookingCreateView(generics.CreateAPIView):
    """Create a new booking"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingListView(generics.ListAPIView):
    """List bookings for the authenticated user"""
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(passenger=self.request.user)


class BookingDetailView(generics.RetrieveAPIView):
    """Get booking details"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(passenger=self.request.user)


class CancelBookingView(APIView):
    """Cancel a booking"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, passenger=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        success, message = booking.cancel_booking(
            reason=serializer.validated_data.get('reason', '')
        )
        
        if success:
            return Response({
                'message': message,
                'refund_amount': float(booking.refund_amount),
                'penalty_amount': float(booking.penalty_amount)
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )


class ConfirmBookingView(APIView):
    """Confirm a booking after payment"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, passenger=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.confirm_booking():
            return Response({
                'message': 'Booking confirmed successfully',
                'booking': BookingSerializer(booking).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Booking cannot be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DriverBookingsView(generics.ListAPIView):
    """List bookings for driver's trips"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return Booking.objects.filter(
            trip__driver=self.request.user.driver_profile
        )


class MarkNoShowView(APIView):
    """Mark a passenger as no-show (driver only)"""
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(
                pk=pk,
                trip__driver=request.user.driver_profile
            )
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        booking.mark_no_show()
        
        return Response({
            'message': 'Passenger marked as no-show',
            'penalty_amount': float(booking.penalty_amount)
        }, status=status.HTTP_200_OK)


class StartTripView(APIView):
    """Start a trip (driver only)"""
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk, driver=request.user.driver_profile)
        except Trip.DoesNotExist:
            return Response(
                {'error': 'Trip not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if trip.status != 'confirmed':
            return Response(
                {'error': 'Trip cannot be started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = 'in_progress'
        trip.save()
        
        return Response({
            'message': 'Trip started successfully',
            'trip': TripSerializer(trip).data
        }, status=status.HTTP_200_OK)


class CompleteTripView(APIView):
    """Complete a trip (driver only)"""
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def post(self, request, pk):
        try:
            trip = Trip.objects.get(pk=pk, driver=request.user.driver_profile)
        except Trip.DoesNotExist:
            return Response(
                {'error': 'Trip not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if trip.status != 'in_progress':
            return Response(
                {'error': 'Trip is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = 'completed'
        trip.actual_arrival_datetime = timezone.now()
        trip.save()
        
        # Update driver stats
        driver = trip.driver
        driver.total_trips += 1
        driver.completed_trips += 1
        driver.calculate_reputation_score()
        
        # Mark all bookings as completed
        trip.bookings.filter(status='confirmed').update(status='completed')
        
        # Release payments
        for booking in trip.bookings.filter(status='completed'):
            for payment in booking.payments.filter(status='held'):
                payment.release_to_driver()
        
        return Response({
            'message': 'Trip completed successfully',
            'trip': TripSerializer(trip).data
        }, status=status.HTTP_200_OK)


class TripMessagesView(generics.ListCreateAPIView):
    """List and create messages for a trip"""
    serializer_class = TripMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        # User must be either the driver or a passenger
        return TripMessage.objects.filter(
            Q(trip__id=trip_id) &
            (Q(trip__driver__user=self.request.user) | Q(trip__bookings__passenger=self.request.user))
        ).distinct()

    def perform_create(self, serializer):
        trip_id = self.kwargs.get('trip_id')
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            raise serializers.ValidationError('Trip not found')
        
        # Verify user is part of this trip
        is_driver = trip.driver.user == self.request.user
        is_passenger = trip.bookings.filter(passenger=self.request.user).exists()
        
        if not (is_driver or is_passenger):
            raise PermissionError('You are not part of this trip')
        
        serializer.save(trip=trip)


class TripTrackingView(generics.ListCreateAPIView):
    """List and create trip tracking data"""
    serializer_class = TripTrackingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return TripTracking.objects.filter(trip__id=trip_id)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsDriver()]
        return [permissions.IsAuthenticated()]
