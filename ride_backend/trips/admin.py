from django.contrib import admin
from .models import Trip, Booking, TripMessage, TripTracking


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'from_city', 'to_city', 'departure_datetime', 
                   'price_per_seat', 'available_seats', 'status')
    list_filter = ('status', 'is_active', 'departure_datetime')
    search_fields = ('from_city', 'to_city', 'driver__user__email')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Driver & Route', {'fields': ('driver', 'route')}),
        ('Trip Details', {'fields': ('from_city', 'to_city', 'departure_datetime', 
                                     'estimated_arrival_datetime', 'actual_arrival_datetime')}),
        ('Pricing & Seats', {'fields': ('price_per_seat', 'available_seats', 'total_seats')}),
        ('Status', {'fields': ('status', 'is_active')}),
        ('Additional Info', {'fields': ('notes', 'cancellation_reason', 'cancelled_at')}),
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'passenger', 'number_of_seats', 'total_amount', 
                   'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('passenger__email', 'trip__from_city', 'trip__to_city')
    readonly_fields = ('total_amount', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Booking', {'fields': ('trip', 'passenger')}),
        ('Details', {'fields': ('number_of_seats', 'price_per_seat', 'total_amount')}),
        ('Status', {'fields': ('status',)}),
        ('Penalties & Refunds', {'fields': ('penalty_amount', 'refund_amount')}),
        ('Pickup', {'fields': ('pickup_location', 'pickup_notes')}),
        ('Cancellation', {'fields': ('cancellation_reason', 'cancelled_at')}),
    )


@admin.register(TripMessage)
class TripMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'sender', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('trip__id', 'sender__email', 'message')
    readonly_fields = ('created_at',)


@admin.register(TripTracking)
class TripTrackingAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'latitude', 'longitude', 'speed', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('trip__id',)
    readonly_fields = ('created_at',)
