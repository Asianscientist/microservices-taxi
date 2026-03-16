from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review, ReviewResponse, ReviewReport, DriverRating
from drivers.models import DriverProfile
from trips.models import Booking
from .serializers import (
    ReviewSerializer,
    ReviewListSerializer,
    ReviewResponseSerializer,
    ReviewReportSerializer,
    DriverRatingSerializer
)
from drivers.permissions import IsDriver


class CreateReviewView(generics.CreateAPIView):
    """Create a review for a completed booking"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        
        try:
            booking = Booking.objects.get(
                id=booking_id,
                passenger=self.request.user
            )
        except Booking.DoesNotExist:
            raise serializers.ValidationError('Booking not found')
        
        serializer.save(booking=booking)


class ReviewListView(generics.ListAPIView):
    """List reviews"""
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['reviewed_driver', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user)


class DriverReviewsView(generics.ListAPIView):
    """List reviews for a specific driver"""
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        driver_id = self.kwargs.get('driver_id')
        return Review.objects.filter(
            reviewed_driver_id=driver_id,
            is_approved=True
        )


class MyReviewsView(generics.ListAPIView):
    """List reviews written by the authenticated user"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user)


class ReviewsReceivedView(generics.ListAPIView):
    """List reviews received by the authenticated driver"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        return Review.objects.filter(
            reviewed_driver=self.request.user.driver_profile
        )


class CreateReviewResponseView(generics.CreateAPIView):
    """Create a response to a review (driver only)"""
    queryset = ReviewResponse.objects.all()
    serializer_class = ReviewResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def perform_create(self, serializer):
        review_id = self.request.data.get('review')
        
        try:
            review = Review.objects.get(
                id=review_id,
                reviewed_driver=self.request.user.driver_profile
            )
        except Review.DoesNotExist:
            raise serializers.ValidationError('Review not found or not authorized')
        
        # Check if response already exists
        if hasattr(review, 'response'):
            raise serializers.ValidationError('Response already exists for this review')
        
        serializer.save(review=review)


class ReportReviewView(generics.CreateAPIView):
    """Report a review"""
    queryset = ReviewReport.objects.all()
    serializer_class = ReviewReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReviewReportListView(generics.ListAPIView):
    """List review reports (admin only)"""
    queryset = ReviewReport.objects.all()
    serializer_class = ReviewReportSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'reason']


class ResolveReviewReportView(APIView):
    """Resolve a review report (admin only)"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            report = ReviewReport.objects.get(pk=pk)
        except ReviewReport.DoesNotExist:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        action = request.data.get('action')  # 'dismiss' or 'flag_review'
        admin_notes = request.data.get('admin_notes', '')
        
        if action == 'dismiss':
            report.status = 'dismissed'
        elif action == 'flag_review':
            report.status = 'resolved'
            report.review.is_flagged = True
            report.review.flag_reason = admin_notes
            report.review.save()
        else:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.admin_notes = admin_notes
        report.resolved_by = request.user
        from django.utils import timezone
        report.resolved_at = timezone.now()
        report.save()
        
        return Response({
            'message': 'Report resolved successfully',
            'report': ReviewReportSerializer(report).data
        }, status=status.HTTP_200_OK)


class DriverRatingStatsView(generics.RetrieveAPIView):
    """Get driver rating statistics"""
    serializer_class = DriverRatingSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        driver_id = self.kwargs.get('driver_id')
        try:
            driver = DriverProfile.objects.get(pk=driver_id)
        except DriverProfile.DoesNotExist:
            raise serializers.ValidationError('Driver not found')
        
        # Get or create rating stats
        rating_stats, created = DriverRating.objects.get_or_create(driver=driver)
        
        # Update stats if they're outdated
        rating_stats.update_stats()
        
        return rating_stats
