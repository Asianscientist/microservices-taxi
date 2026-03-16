from django.contrib import admin
from .models import Review, ReviewResponse, ReviewReport, DriverRating


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'reviewer', 'reviewed_driver', 'rating', 'is_approved', 
                   'is_flagged', 'created_at')
    list_filter = ('rating', 'is_approved', 'is_flagged', 'created_at')
    search_fields = ('reviewer__email', 'reviewed_driver__user__email', 'comment')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Review Info', {'fields': ('booking', 'reviewer', 'reviewed_driver')}),
        ('Ratings', {'fields': ('rating', 'punctuality_rating', 'safety_rating', 
                               'vehicle_condition_rating', 'communication_rating')}),
        ('Content', {'fields': ('comment',)}),
        ('Moderation', {'fields': ('is_approved', 'is_flagged', 'flag_reason')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['approve_reviews', 'flag_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True, is_flagged=False)
        self.message_user(request, f"{queryset.count()} reviews approved")
    approve_reviews.short_description = "Approve selected reviews"
    
    def flag_reviews(self, request, queryset):
        queryset.update(is_flagged=True)
        self.message_user(request, f"{queryset.count()} reviews flagged")
    flag_reviews.short_description = "Flag selected reviews"


@admin.register(ReviewResponse)
class ReviewResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'responder', 'created_at')
    search_fields = ('review__id', 'responder__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'reporter', 'reason', 'status', 'created_at')
    list_filter = ('reason', 'status', 'created_at')
    search_fields = ('review__id', 'reporter__email')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at')
    
    fieldsets = (
        ('Report Info', {'fields': ('review', 'reporter')}),
        ('Details', {'fields': ('reason', 'description', 'status')}),
        ('Resolution', {'fields': ('admin_notes', 'resolved_by', 'resolved_at')}),
    )


@admin.register(DriverRating)
class DriverRatingAdmin(admin.ModelAdmin):
    list_display = ('driver', 'average_rating', 'total_reviews', 'updated_at')
    search_fields = ('driver__user__email',)
    readonly_fields = ('updated_at',)
    
    fieldsets = (
        ('Driver', {'fields': ('driver',)}),
        ('Overall Stats', {'fields': ('total_reviews', 'average_rating')}),
        ('Detailed Averages', {'fields': ('average_punctuality', 'average_safety',
                                         'average_vehicle_condition', 'average_communication')}),
        ('Distribution', {'fields': ('five_star_count', 'four_star_count', 'three_star_count',
                                    'two_star_count', 'one_star_count')}),
    )
