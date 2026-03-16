from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import DriverProfile, Route, DriverAvailability, DriverDocument
from .serializers import (
    DriverProfileSerializer,
    DriverProfileCreateSerializer,
    DriverVerificationSerializer,
    DriverListSerializer,
    RouteSerializer,
    DriverAvailabilitySerializer,
    DriverDocumentSerializer
)
from .permissions import IsDriver, IsDriverOwner, IsAdmin


class DriverProfileCreateView(generics.CreateAPIView):
    """Create driver profile (requires user to be logged in)"""
    queryset = DriverProfile.objects.all()
    serializer_class = DriverProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Check if user already has a driver profile
        if hasattr(request.user, 'driver_profile'):
            return Response(
                {'error': 'Driver profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user type is driver
        if request.user.user_type != 'driver':
            request.user.user_type = 'driver'
            request.user.save()
        
        return super().create(request, *args, **kwargs)


class DriverProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get and update driver profile"""
    queryset = DriverProfile.objects.all()
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriverOwner]

    def get_object(self):
        return self.request.user.driver_profile


class DriverListView(generics.ListAPIView):
    """List all active and verified drivers"""
    queryset = DriverProfile.objects.filter(
        is_active=True,
        license_verified=True,
        is_suspended=False
    )
    serializer_class = DriverListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_available', 'vehicle_make', 'vehicle_model']
    search_fields = ['user__first_name', 'user__last_name', 'bio']
    ordering_fields = ['reputation_score', 'average_rating', 'total_trips']
    ordering = ['-reputation_score']  # Default ordering by reputation


class DriverDetailPublicView(generics.RetrieveAPIView):
    """Get public driver profile details"""
    queryset = DriverProfile.objects.filter(
        is_active=True,
        license_verified=True
    )
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.AllowAny]


class DriverVerificationView(APIView):
    """Admin endpoint to verify driver license"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            driver = DriverProfile.objects.get(pk=pk)
        except DriverProfile.DoesNotExist:
            return Response(
                {'error': 'Driver not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = DriverVerificationSerializer(
            driver,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Send notification to driver
        from accounts.utils import send_notification_email
        if driver.license_verification_status == 'approved':
            send_notification_email(
                driver.user,
                'Driver License Approved',
                'Congratulations! Your driver license has been verified. You can now start accepting trips.'
            )
        else:
            send_notification_email(
                driver.user,
                'Driver License Verification Failed',
                f'Your driver license verification was not approved. Reason: {driver.license_verification_notes}'
            )
        
        return Response(
            DriverProfileSerializer(driver).data,
            status=status.HTTP_200_OK
        )


class PendingDriverVerificationsView(generics.ListAPIView):
    """Admin endpoint to list pending driver verifications"""
    queryset = DriverProfile.objects.filter(license_verification_status='pending')
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class RouteListCreateView(generics.ListCreateAPIView):
    """List and create routes"""
    queryset = Route.objects.filter(is_active=True)
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['from_city', 'to_city']


class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete route"""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class DriverAvailabilityView(generics.ListCreateAPIView):
    """List and create driver availability schedules"""
    serializer_class = DriverAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return DriverAvailability.objects.filter(driver=self.request.user.driver_profile)

    def perform_create(self, serializer):
        serializer.save(driver=self.request.user.driver_profile)


class DriverDocumentView(generics.ListCreateAPIView):
    """List and upload driver documents"""
    serializer_class = DriverDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return DriverDocument.objects.filter(driver=self.request.user.driver_profile)

    def perform_create(self, serializer):
        serializer.save(driver=self.request.user.driver_profile)


class DriverStatsView(APIView):
    """Get driver statistics"""
    permission_classes = [permissions.IsAuthenticated, IsDriverOwner]

    def get(self, request):
        driver = request.user.driver_profile
        
        stats = {
            'total_trips': driver.total_trips,
            'completed_trips': driver.completed_trips,
            'cancelled_trips': driver.cancelled_trips,
            'cancellation_rate': round((driver.cancelled_trips / driver.total_trips * 100) if driver.total_trips > 0 else 0, 2),
            'average_rating': float(driver.average_rating),
            'reputation_score': float(driver.reputation_score),
            'total_reviews': driver.reviews_received.filter(is_approved=True).count(),
            'verification_status': driver.license_verification_status,
            'can_accept_trips': driver.can_accept_trips(),
        }
        
        return Response(stats)


class ToggleDriverAvailabilityView(APIView):
    """Toggle driver availability status"""
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def post(self, request):
        driver = request.user.driver_profile
        driver.is_available = not driver.is_available
        driver.save()
        
        return Response({
            'is_available': driver.is_available,
            'message': f"Availability set to {'available' if driver.is_available else 'unavailable'}"
        })
