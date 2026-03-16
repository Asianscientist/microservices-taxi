from rest_framework import serializers
from .models import DriverProfile, Route, DriverAvailability, DriverDocument
from accounts.serializers import UserProfileSerializer


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    available_routes = RouteSerializer(many=True, read_only=True)
    can_accept_trips = serializers.SerializerMethodField()
    cancellation_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = (
            'user', 'license_verified', 'license_verification_status',
            'verified_by', 'verified_at', 'total_trips', 'completed_trips',
            'cancelled_trips', 'cancellation_count_monthly', 'average_rating',
            'reputation_score', 'is_active', 'is_suspended'
        )

    def get_can_accept_trips(self, obj):
        return obj.can_accept_trips()

    def get_cancellation_rate(self, obj):
        if obj.total_trips > 0:
            return round((obj.cancelled_trips / obj.total_trips) * 100, 2)
        return 0.0


class DriverProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = (
            'license_number', 'license_image_front', 'license_image_back',
            'license_expiry_date', 'vehicle_make', 'vehicle_model', 'vehicle_year',
            'vehicle_color', 'license_plate', 'vehicle_image', 'total_seats',
            'insurance_number', 'insurance_image', 'insurance_expiry_date',
            'years_of_experience', 'bio'
        )

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class DriverVerificationSerializer(serializers.Serializer):
    """Serializer for admin to verify driver license"""
    license_verification_status = serializers.ChoiceField(
        choices=['approved', 'rejected']
    )
    license_verification_notes = serializers.CharField(required=False, allow_blank=True)

    def update(self, instance, validated_data):
        instance.license_verification_status = validated_data['license_verification_status']
        instance.license_verification_notes = validated_data.get('license_verification_notes', '')
        
        if validated_data['license_verification_status'] == 'approved':
            instance.license_verified = True
            instance.is_active = True
        else:
            instance.license_verified = False
            instance.is_active = False
        
        instance.verified_by = self.context['request'].user
        from django.utils import timezone
        instance.verified_at = timezone.now()
        instance.save()
        
        return instance


class DriverAvailabilitySerializer(serializers.ModelSerializer):
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = DriverAvailability
        fields = '__all__'
        read_only_fields = ('driver',)


class DriverDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverDocument
        fields = '__all__'
        read_only_fields = ('driver', 'is_verified')


class DriverListSerializer(serializers.ModelSerializer):
    """Simplified serializer for driver list view"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_photo = serializers.ImageField(source='user.profile_picture', read_only=True)
    routes = serializers.SerializerMethodField()
    
    class Meta:
        model = DriverProfile
        fields = (
            'id', 'user_name', 'user_photo', 'vehicle_make', 'vehicle_model',
            'vehicle_year', 'average_rating', 'total_trips', 'reputation_score',
            'years_of_experience', 'bio', 'is_available', 'routes'
        )

    def get_routes(self, obj):
        return [route.name for route in obj.available_routes.all()]
