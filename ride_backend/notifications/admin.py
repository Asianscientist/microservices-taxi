from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'is_sent_email', 'is_sent_sms', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    
    fieldsets = (
        ('Notification', {'fields': ('user', 'notification_type', 'title', 'message')}),
        ('Related Objects', {'fields': ('related_trip_id', 'related_booking_id', 'related_payment_id')}),
        ('Status', {'fields': ('is_read', 'is_sent_email', 'is_sent_sms')}),
        ('Timestamps', {'fields': ('created_at', 'read_at')}),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_booking_updates', 'sms_booking_updates', 
                   'push_booking_updates', 'email_marketing')
    search_fields = ('user__email',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Email Preferences', {'fields': ('email_booking_updates', 'email_trip_updates',
                                         'email_payment_updates', 'email_reviews', 'email_marketing')}),
        ('SMS Preferences', {'fields': ('sms_booking_updates', 'sms_trip_updates', 'sms_payment_updates')}),
        ('Push Preferences', {'fields': ('push_booking_updates', 'push_trip_updates',
                                        'push_payment_updates', 'push_reviews')}),
    )
