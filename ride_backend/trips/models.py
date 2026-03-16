from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta


class Trip(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled_by_driver', 'Cancelled by Driver'),
        ('cancelled_by_passenger', 'Cancelled by Passenger'),
        ('passenger_no_show', 'Passenger No Show'),
    )
    
    driver = models.ForeignKey('drivers.DriverProfile', on_delete=models.CASCADE, related_name='trips')
    route = models.ForeignKey('drivers.Route', on_delete=models.CASCADE, related_name='trips')
    
    # Trip Details
    from_city = models.CharField(max_length=100)
    to_city = models.CharField(max_length=100)
    departure_datetime = models.DateTimeField()
    estimated_arrival_datetime = models.DateTimeField()
    actual_arrival_datetime = models.DateTimeField(null=True, blank=True)
    
    # Pricing
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)
    available_seats = models.IntegerField(validators=[MinValueValidator(1)])
    total_seats = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    is_active = models.BooleanField(default=True)
    
    # Additional Info
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trips'
        ordering = ['-departure_datetime']

    def __str__(self):
        return f"Trip {self.id}: {self.from_city} → {self.to_city} on {self.departure_datetime.date()}"

    def can_be_cancelled(self):
        """Check if trip can be cancelled"""
        hours_until_departure = (self.departure_datetime - timezone.now()).total_seconds() / 3600
        return hours_until_departure > 0 and self.status in ['pending', 'confirmed']

    def is_late_cancellation(self):
        """Check if cancellation is within the late cancellation window"""
        hours_until_departure = (self.departure_datetime - timezone.now()).total_seconds() / 3600
        return hours_until_departure < settings.CANCELLATION_LIMITS['LATE_CANCELLATION_HOURS']

    def cancel_trip(self, cancelled_by, reason=''):
        """Cancel the trip and apply penalties if needed"""
        if not self.can_be_cancelled():
            return False
        
        self.cancellation_reason = reason
        self.cancelled_at = timezone.now()
        
        if cancelled_by == 'driver':
            self.status = 'cancelled_by_driver'
            self.driver.add_cancellation()
            
            # Notify all passengers and refund
            for booking in self.bookings.filter(status='confirmed'):
                booking.status = 'cancelled'
                booking.refund_amount = booking.total_amount
                booking.save()
                
        elif cancelled_by == 'passenger':
            self.status = 'cancelled_by_passenger'
        
        self.save()
        return True


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking Details
    number_of_seats = models.IntegerField(validators=[MinValueValidator(1)])
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Penalties & Refunds
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Cancellation
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Pickup Details
    pickup_location = models.CharField(max_length=255, blank=True)
    pickup_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id}: {self.passenger.get_full_name()} - {self.trip}"

    def save(self, *args, **kwargs):
        # Calculate total amount
        self.total_amount = self.price_per_seat * self.number_of_seats
        super().save(*args, **kwargs)

    def cancel_booking(self, reason=''):
        """Cancel booking and apply penalties if needed"""
        if not self.trip.can_be_cancelled():
            return False, "Cannot cancel - trip is too soon or already started"
        
        self.cancellation_reason = reason
        self.cancelled_at = timezone.now()
        self.status = 'cancelled'
        
        # Check if it's a late cancellation
        if self.trip.is_late_cancellation():
            self.penalty_amount = settings.PENALTY_FEES['LATE_CANCELLATION']
            self.refund_amount = self.total_amount - self.penalty_amount
        else:
            self.refund_amount = self.total_amount
        
        # Return seats to trip
        self.trip.available_seats += self.number_of_seats
        self.trip.save()
        
        self.save()
        return True, f"Booking cancelled. Refund: ${self.refund_amount}"

    def mark_no_show(self):
        """Mark passenger as no-show and apply penalty"""
        self.status = 'no_show'
        self.penalty_amount = settings.PENALTY_FEES['PASSENGER_NO_SHOW']
        self.refund_amount = max(0, self.total_amount - self.penalty_amount)
        self.save()
        
        # Add penalty to passenger
        self.passenger.add_no_show_penalty()

    def confirm_booking(self):
        """Confirm the booking after payment"""
        if self.status == 'pending':
            self.status = 'confirmed'
            self.trip.available_seats -= self.number_of_seats
            self.trip.save()
            self.save()
            return True
        return False


class TripMessage(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trip_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.get_full_name()} in Trip {self.trip.id}"


class TripTracking(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='tracking')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # km/h
    heading = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # degrees
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trip_tracking'
        ordering = ['-created_at']

    def __str__(self):
        return f"Tracking for Trip {self.trip.id} at {self.created_at}"
