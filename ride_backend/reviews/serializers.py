from rest_framework import serializers
from .models import Review, ReviewResponse, ReviewReport, DriverRating
from accounts.serializers import UserProfileSerializer


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserProfileSerializer(read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = (
            'reviewer', 'reviewed_driver', 'is_approved',
            'is_flagged', 'flag_reason'
        )

    def create(self, validated_data):
        # Get booking from context or validated data
        booking = validated_data.get('booking')
        
        # Verify booking is completed
        if booking.status != 'completed':
            raise serializers.ValidationError('Can only review completed trips')
        
        # Check if review already exists
        if hasattr(booking, 'review'):
            raise serializers.ValidationError('Review already exists for this booking')
        
        # Set reviewer and reviewed_driver
        validated_data['reviewer'] = self.context['request'].user
        validated_data['reviewed_driver'] = booking.trip.driver
        
        return super().create(validated_data)


class ReviewListSerializer(serializers.ModelSerializer):
    """Simplified serializer for review list"""
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    trip_route = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = (
            'id', 'reviewer_name', 'rating', 'comment',
            'trip_route', 'created_at'
        )

    def get_trip_route(self, obj):
        return f"{obj.booking.trip.from_city} → {obj.booking.trip.to_city}"


class ReviewResponseSerializer(serializers.ModelSerializer):
    responder = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ReviewResponse
        fields = '__all__'
        read_only_fields = ('responder',)

    def create(self, validated_data):
        validated_data['responder'] = self.context['request'].user
        return super().create(validated_data)


class ReviewReportSerializer(serializers.ModelSerializer):
    reporter = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ReviewReport
        fields = '__all__'
        read_only_fields = (
            'reporter', 'status', 'admin_notes',
            'resolved_by', 'resolved_at'
        )

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class DriverRatingSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    rating_distribution = serializers.SerializerMethodField()
    
    class Meta:
        model = DriverRating
        fields = '__all__'

    def get_rating_distribution(self, obj):
        return {
            '5': obj.five_star_count,
            '4': obj.four_star_count,
            '3': obj.three_star_count,
            '2': obj.two_star_count,
            '1': obj.one_star_count,
        }
