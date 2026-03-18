from rest_framework import serializers
from .models import Trip, Booking, TripMessage, TripTracking
from drivers.serializers import DriverListSerializer, RouteSerializer
from accounts.serializers import UserProfileSerializer


class TripSerializer(serializers.ModelSerializer):
    driver = DriverListSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    route_id = serializers.IntegerField(write_only=True)
    bookings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ('driver', 'status', 'actual_arrival_datetime')

    def get_bookings_count(self, obj):
        return obj.bookings.filter(status='confirmed').count()

    def create(self, validated_data):
        validated_data['driver'] = self.context['request'].user.driver_profile
        validated_data['total_seats'] = validated_data.get('available_seats')
        return super().create(validated_data)


class TripListSerializer(serializers.ModelSerializer):
    """Simplified serializer for trip list"""
    driver_id = serializers.IntegerField(source='driver.id', read_only=True)
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    driver_rating = serializers.DecimalField(source='driver.average_rating', max_digits=3, decimal_places=2, read_only=True)
    available_seats_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = (
            'id', 'from_city', 'to_city', 'departure_datetime',
            'estimated_arrival_datetime', 'price_per_seat', 'available_seats',
            'available_seats_count', 'driver_id', 'driver_name', 'driver_rating', 'status'
        )

    def get_available_seats_count(self, obj):
        return obj.available_seats


class BookingSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    trip_id = serializers.IntegerField(write_only=True)
    passenger = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = (
            'passenger', 'price_per_seat', 'total_amount', 'status',
            'penalty_amount', 'refund_amount', 'cancelled_at'
        )

    def create(self, validated_data):
        trip_id = validated_data.pop('trip_id')
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            raise serializers.ValidationError('Trip not found')
        
        # Validate trip status
        if trip.status != 'pending' and trip.status != 'confirmed':
            raise serializers.ValidationError('Trip is not available for booking')
        
        # Validate available seats
        if validated_data['number_of_seats'] > trip.available_seats:
            raise serializers.ValidationError(f'Only {trip.available_seats} seats available')
        
        # Set passenger and price
        validated_data['passenger'] = self.context['request'].user
        validated_data['trip'] = trip
        validated_data['price_per_seat'] = trip.price_per_seat
        
        return super().create(validated_data)


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for booking list"""
    trip_from = serializers.CharField(source='trip.from_city', read_only=True)
    trip_to = serializers.CharField(source='trip.to_city', read_only=True)
    trip_date = serializers.DateTimeField(source='trip.departure_datetime', read_only=True)
    driver_name = serializers.CharField(source='trip.driver.user.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = (
            'id', 'trip_id', 'trip_from', 'trip_to', 'trip_date',
            'driver_name', 'number_of_seats', 'total_amount', 'status',
            'penalty_amount', 'refund_amount', 'created_at'
        )


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)


class TripMessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = TripMessage
        fields = '__all__'
        read_only_fields = ('sender', 'is_read')

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class TripTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripTracking
        fields = '__all__'
        read_only_fields = ('trip',)

    def create(self, validated_data):
        # Get the trip from the driver's current active trip
        driver = self.context['request'].user.driver_profile
        try:
            trip = Trip.objects.get(driver=driver, status='in_progress')
            validated_data['trip'] = trip
        except Trip.DoesNotExist:
            raise serializers.ValidationError('No active trip found')
        
        return super().create(validated_data)
