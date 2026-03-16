from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PhoneVerification, UserActivity


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'phone_verified', 'is_suspended', 'created_at')
    list_filter = ('user_type', 'phone_verified', 'is_suspended', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'phone_verified', 
                                      'profile_picture', 'date_of_birth', 'address', 'city', 'country')}),
        ('User Type', {'fields': ('user_type',)}),
        ('Penalties', {'fields': ('no_show_count', 'total_penalty_amount', 'is_suspended', 'suspension_reason')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'user_type'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')


@admin.register(PhoneVerification)
class PhoneVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'otp_code', 'verified', 'created_at', 'expires_at')
    list_filter = ('verified',)
    search_fields = ('user__email', 'phone_number')
    readonly_fields = ('created_at',)


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'created_at', 'ip_address')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__email', 'description')
    readonly_fields = ('created_at',)
