from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg
from django.contrib.auth.models import User

class Review(models.Model):
    booking = models.OneToOneField('trips.Booking', on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewed_driver = models.ForeignKey('drivers.DriverProfile', on_delete=models.CASCADE, related_name='reviews_received')
    
    # Rating (1-5 stars)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Detailed ratings
    punctuality_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    safety_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    vehicle_condition_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    communication_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    
    # Review text
    comment = models.TextField(max_length=1000)
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.reviewer.get_full_name()} for {self.reviewed_driver.user.get_full_name()} - {self.rating} stars"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update driver's average rating
        self.update_driver_rating()

    def update_driver_rating(self):
        """Update the driver's average rating"""
        avg_rating = Review.objects.filter(
            reviewed_driver=self.reviewed_driver,
            is_approved=True
        ).aggregate(Avg('rating'))['rating__avg']
        
        if avg_rating:
            self.reviewed_driver.average_rating = round(avg_rating, 2)
            self.reviewed_driver.calculate_reputation_score()


class ReviewResponse(models.Model):
    review = models.OneToOneField(Review, on_delete=models.CASCADE, related_name='response')
    responder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='review_responses')
    response_text = models.TextField(max_length=500)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review_responses'

    def __str__(self):
        return f"Response to review {self.review.id} by {self.responder.get_full_name()}"


class ReviewReport(models.Model):
    REPORT_REASONS = (
        ('inappropriate', 'Inappropriate Content'),
        ('spam', 'Spam'),
        ('false_info', 'False Information'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='review_reports')
    
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for review {self.review.id} - {self.reason}"


class DriverRating(models.Model):
    """Aggregated rating statistics for drivers"""
    driver = models.OneToOneField('drivers.DriverProfile', on_delete=models.CASCADE, related_name='rating_stats')
    
    # Overall stats
    total_reviews = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Detailed averages
    average_punctuality = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    average_safety = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    average_vehicle_condition = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    average_communication = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Rating distribution
    five_star_count = models.IntegerField(default=0)
    four_star_count = models.IntegerField(default=0)
    three_star_count = models.IntegerField(default=0)
    two_star_count = models.IntegerField(default=0)
    one_star_count = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'driver_ratings'

    def __str__(self):
        return f"Rating stats for {self.driver.user.get_full_name()}"

    def update_stats(self):
        """Recalculate all rating statistics"""
        reviews = Review.objects.filter(
            reviewed_driver=self.driver,
            is_approved=True
        )
        
        self.total_reviews = reviews.count()
        
        if self.total_reviews > 0:
            # Overall rating
            self.average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            
            # Detailed ratings
            self.average_punctuality = reviews.filter(
                punctuality_rating__isnull=False
            ).aggregate(Avg('punctuality_rating'))['punctuality_rating__avg'] or 0
            
            self.average_safety = reviews.filter(
                safety_rating__isnull=False
            ).aggregate(Avg('safety_rating'))['safety_rating__avg'] or 0
            
            self.average_vehicle_condition = reviews.filter(
                vehicle_condition_rating__isnull=False
            ).aggregate(Avg('vehicle_condition_rating'))['vehicle_condition_rating__avg'] or 0
            
            self.average_communication = reviews.filter(
                communication_rating__isnull=False
            ).aggregate(Avg('communication_rating'))['communication_rating__avg'] or 0
            
            # Rating distribution
            self.five_star_count = reviews.filter(rating=5).count()
            self.four_star_count = reviews.filter(rating=4).count()
            self.three_star_count = reviews.filter(rating=3).count()
            self.two_star_count = reviews.filter(rating=2).count()
            self.one_star_count = reviews.filter(rating=1).count()
        
        self.save()
