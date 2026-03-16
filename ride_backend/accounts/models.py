from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timezone
from datetime import timedelta
import random
import string


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )
    
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='passenger')
    phone_number = PhoneNumberField(blank=True, null=True)
    phone_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Penalty tracking
    no_show_count = models.IntegerField(default=0)
    last_no_show_reset = models.DateTimeField(default=timezone.now)
    total_penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_suspended = models.BooleanField(default=False)
    suspension_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def reset_monthly_penalties(self):
        """Reset no-show count if a month has passed"""
        if timezone.now() - self.last_no_show_reset > timedelta(days=30):
            self.no_show_count = 0
            self.last_no_show_reset = timezone.now()
            self.save()

    def add_no_show_penalty(self):
        """Add a no-show penalty and check if suspension is needed"""
        from django.conf import settings
        self.reset_monthly_penalties()
        self.no_show_count += 1
        self.total_penalty_amount += settings.PENALTY_FEES['PASSENGER_NO_SHOW']
        
        if self.no_show_count >= settings.CANCELLATION_LIMITS['PASSENGER_MAX_NO_SHOWS_PER_MONTH']:
            self.is_suspended = True
            self.suspension_reason = f"Exceeded maximum no-shows ({self.no_show_count}) for the month"
        
        self.save()


class PhoneVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='phone_verifications')
    phone_number = PhoneNumberField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    class Meta:
        db_table = 'phone_verifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.phone_number}"

    @classmethod
    def generate_otp(cls, user, phone_number):
        """Generate a new OTP code"""
        from django.conf import settings
        
        # Invalidate previous OTPs
        cls.objects.filter(user=user, phone_number=phone_number, verified=False).update(verified=True)
        
        otp_code = ''.join(random.choices(string.digits, k=settings.OTP_LENGTH))
        expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
        
        return cls.objects.create(
            user=user,
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=expires_at
        )

    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.verified and timezone.now() < self.expires_at and self.attempts < 3

    def verify(self, code):
        """Verify the OTP code"""
        self.attempts += 1
        self.save()
        
        if not self.is_valid():
            return False
        
        if self.otp_code == code:
            self.verified = True
            self.user.phone_number = self.phone_number
            self.user.phone_verified = True
            self.user.save()
            self.save()
            return True
        
        return False


class UserActivity(models.Model):
    ACTIVITY_TYPES = (
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('profile_update', 'Profile Update'),
        ('password_change', 'Password Change'),
        ('booking_created', 'Booking Created'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('payment_made', 'Payment Made'),
        ('review_posted', 'Review Posted'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} at {self.created_at}"
