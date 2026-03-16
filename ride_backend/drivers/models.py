from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta


class DriverProfile(models.Model):
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    
    # License Information
    license_number = models.CharField(max_length=50, unique=True)
    license_image_front = models.ImageField(upload_to='licenses/front/')
    license_image_back = models.ImageField(upload_to='licenses/back/')
    license_expiry_date = models.DateField()
    license_verified = models.BooleanField(default=False)
    license_verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    license_verification_notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_drivers'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Vehicle Information
    vehicle_make = models.CharField(max_length=50)
    vehicle_model = models.CharField(max_length=50)
    vehicle_year = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2030)])
    vehicle_color = models.CharField(max_length=30)
    license_plate = models.CharField(max_length=20, unique=True)
    vehicle_image = models.ImageField(upload_to='vehicles/', blank=True, null=True)
    total_seats = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(8)])
    
    # Insurance
    insurance_number = models.CharField(max_length=100)
    insurance_image = models.ImageField(upload_to='insurance/')
    insurance_expiry_date = models.DateField()
    
    # Driver Details
    years_of_experience = models.IntegerField(validators=[MinValueValidator(0)])
    bio = models.TextField(max_length=500, blank=True)
    
    # Availability
    is_available = models.BooleanField(default=True)
    available_routes = models.ManyToManyField('Route', related_name='drivers')
    
    # Reputation & Stats
    total_trips = models.IntegerField(default=0)
    completed_trips = models.IntegerField(default=0)
    cancelled_trips = models.IntegerField(default=0)
    cancellation_count_monthly = models.IntegerField(default=0)
    last_cancellation_reset = models.DateTimeField(default=timezone.now)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    reputation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Account Status
    is_active = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    suspension_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'driver_profiles'
        ordering = ['-reputation_score', '-average_rating']

    def __str__(self):
        return f"Driver: {self.user.get_full_name()}"

    def reset_monthly_cancellations(self):
        """Reset cancellation count if a month has passed"""
        if timezone.now() - self.last_cancellation_reset > timedelta(days=30):
            self.cancellation_count_monthly = 0
            self.last_cancellation_reset = timezone.now()
            self.save()

    def add_cancellation(self):
        """Add a cancellation and check if suspension is needed"""
        self.reset_monthly_cancellations()
        self.cancelled_trips += 1
        self.cancellation_count_monthly += 1
        
        if self.cancellation_count_monthly >= settings.CANCELLATION_LIMITS['DRIVER_MAX_CANCELLATIONS_PER_MONTH']:
            self.is_suspended = True
            self.suspension_reason = f"Exceeded maximum cancellations ({self.cancellation_count_monthly}) for the month"
        
        self.calculate_reputation_score()
        self.save()

    def calculate_reputation_score(self):
        """
        Calculate reputation score based on:
        - Rating (50%)
        - Completed trips (30%)
        - Low cancellation rate (20%)
        """
        # Rating component (0-100)
        rating_score = (self.average_rating / 5.0) * 100 if self.average_rating else 0
        
        # Completed trips component (0-100)
        # Scale: 0 trips = 0, 100+ trips = 100
        trips_score = min((self.completed_trips / 100) * 100, 100)
        
        # Cancellation rate component (0-100)
        # Lower cancellation rate = higher score
        if self.total_trips > 0:
            cancellation_rate = (self.cancelled_trips / self.total_trips)
            cancellation_score = max(0, (1 - cancellation_rate) * 100)
        else:
            cancellation_score = 100  # No trips yet, assume perfect
        
        # Weighted average
        weights = settings.REPUTATION_WEIGHTS
        self.reputation_score = (
            (rating_score * weights['RATING']) +
            (trips_score * weights['COMPLETED_TRIPS']) +
            (cancellation_score * weights['CANCELLATION_RATE'])
        )
        
        self.save()
        return self.reputation_score

    def can_accept_trips(self):
        """Check if driver can accept new trips"""
        return (
            self.is_active and
            not self.is_suspended and
            self.license_verified and
            self.is_available and
            self.license_verification_status == 'approved'
        )


class Route(models.Model):
    name = models.CharField(max_length=100, unique=True)
    from_city = models.CharField(max_length=100)
    to_city = models.CharField(max_length=100)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    estimated_duration_minutes = models.IntegerField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'routes'
        unique_together = ('from_city', 'to_city')

    def __str__(self):
        return f"{self.from_city} → {self.to_city}"


class DriverAvailability(models.Model):
    DAYS_OF_WEEK = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='availability_schedule')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'driver_availability'
        unique_together = ('driver', 'day_of_week', 'start_time')
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.driver.user.get_full_name()} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class DriverDocument(models.Model):
    DOCUMENT_TYPES = (
        ('license', 'Driving License'),
        ('insurance', 'Insurance'),
        ('vehicle_registration', 'Vehicle Registration'),
        ('background_check', 'Background Check'),
        ('other', 'Other'),
    )
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    document_file = models.FileField(upload_to='driver_documents/')
    description = models.TextField(blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'driver_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.driver.user.get_full_name()} - {self.get_document_type_display()}"
