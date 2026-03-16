from django.contrib import admin
from .models import DriverProfile, Route, DriverAvailability, DriverDocument


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_verification_status', 'reputation_score', 'average_rating', 
                   'total_trips', 'is_active', 'is_available')
    list_filter = ('license_verification_status', 'is_active', 'is_suspended', 'is_available')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'license_number', 'license_plate')
    readonly_fields = ('total_trips', 'completed_trips', 'cancelled_trips', 'average_rating', 
                      'reputation_score', 'verified_at', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('License', {'fields': ('license_number', 'license_image_front', 'license_image_back',
                               'license_expiry_date', 'license_verified', 'license_verification_status',
                               'license_verification_notes', 'verified_by', 'verified_at')}),
        ('Vehicle', {'fields': ('vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_color',
                               'license_plate', 'vehicle_image', 'total_seats')}),
        ('Insurance', {'fields': ('insurance_number', 'insurance_image', 'insurance_expiry_date')}),
        ('Details', {'fields': ('years_of_experience', 'bio', 'available_routes')}),
        ('Stats', {'fields': ('total_trips', 'completed_trips', 'cancelled_trips',
                            'average_rating', 'reputation_score')}),
        ('Status', {'fields': ('is_available', 'is_active', 'is_suspended', 'suspension_reason')}),
    )
    
    actions = ['approve_license', 'reject_license']
    
    def approve_license(self, request, queryset):
        for driver in queryset:
            driver.license_verification_status = 'approved'
            driver.license_verified = True
            driver.is_active = True
            driver.verified_by = request.user
            from django.utils import timezone
            driver.verified_at = timezone.now()
            driver.save()
        self.message_user(request, f"{queryset.count()} drivers approved")
    approve_license.short_description = "Approve selected drivers"
    
    def reject_license(self, request, queryset):
        for driver in queryset:
            driver.license_verification_status = 'rejected'
            driver.license_verified = False
            driver.is_active = False
            driver.verified_by = request.user
            from django.utils import timezone
            driver.verified_at = timezone.now()
            driver.save()
        self.message_user(request, f"{queryset.count()} drivers rejected")
    reject_license.short_description = "Reject selected drivers"


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'from_city', 'to_city', 'distance_km', 'base_price', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('from_city', 'to_city', 'name')


@admin.register(DriverAvailability)
class DriverAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('driver', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')
    search_fields = ('driver__user__email',)


@admin.register(DriverDocument)
class DriverDocumentAdmin(admin.ModelAdmin):
    list_display = ('driver', 'document_type', 'is_verified', 'expiry_date', 'uploaded_at')
    list_filter = ('document_type', 'is_verified')
    search_fields = ('driver__user__email',)
