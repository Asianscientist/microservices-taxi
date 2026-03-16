from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('trip_started', 'Trip Started'),
        ('trip_completed', 'Trip Completed'),
        ('payment_received', 'Payment Received'),
        ('payout_processed', 'Payout Processed'),
        ('review_received', 'Review Received'),
        ('driver_verified', 'Driver Verified'),
        ('driver_rejected', 'Driver Rejected'),
        ('no_show_penalty', 'No Show Penalty'),
        ('cancellation_warning', 'Cancellation Warning'),
        ('account_suspended', 'Account Suspended'),
        ('general', 'General'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Related objects (optional)
    related_trip_id = models.IntegerField(null=True, blank=True)
    related_booking_id = models.IntegerField(null=True, blank=True)
    related_payment_id = models.CharField(max_length=50, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent_email = models.BooleanField(default=False)
    is_sent_sms = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.user.email}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save()

    @classmethod
    def create_notification(cls, user, notification_type, title, message, **kwargs):
        """Helper method to create notifications"""
        return cls.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_trip_id=kwargs.get('trip_id'),
            related_booking_id=kwargs.get('booking_id'),
            related_payment_id=kwargs.get('payment_id'),
        )


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Email preferences
    email_booking_updates = models.BooleanField(default=True)
    email_trip_updates = models.BooleanField(default=True)
    email_payment_updates = models.BooleanField(default=True)
    email_reviews = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)
    
    # SMS preferences
    sms_booking_updates = models.BooleanField(default=True)
    sms_trip_updates = models.BooleanField(default=True)
    sms_payment_updates = models.BooleanField(default=False)
    
    # Push notification preferences
    push_booking_updates = models.BooleanField(default=True)
    push_trip_updates = models.BooleanField(default=True)
    push_payment_updates = models.BooleanField(default=True)
    push_reviews = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'

    def __str__(self):
        return f"Notification preferences for {self.user.email}"
