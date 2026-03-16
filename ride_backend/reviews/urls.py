from django.urls import path
from .views import (
    CreateReviewView,
    ReviewListView,
    ReviewDetailView,
    DriverReviewsView,
    MyReviewsView,
    ReviewsReceivedView,
    CreateReviewResponseView,
    ReportReviewView,
    ReviewReportListView,
    ResolveReviewReportView,
    DriverRatingStatsView,
)

app_name = 'reviews'

urlpatterns = [
    # Reviews
    path('', ReviewListView.as_view(), name='list'),
    path('create/', CreateReviewView.as_view(), name='create'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='detail'),
    path('my-reviews/', MyReviewsView.as_view(), name='my_reviews'),
    path('received/', ReviewsReceivedView.as_view(), name='received'),
    path('driver/<int:driver_id>/', DriverReviewsView.as_view(), name='driver_reviews'),
    
    # Review Responses
    path('responses/create/', CreateReviewResponseView.as_view(), name='create_response'),
    
    # Review Reports
    path('report/', ReportReviewView.as_view(), name='report'),
    path('reports/', ReviewReportListView.as_view(), name='reports'),
    path('reports/<int:pk>/resolve/', ResolveReviewReportView.as_view(), name='resolve_report'),
    
    # Rating Stats
    path('driver/<int:driver_id>/stats/', DriverRatingStatsView.as_view(), name='driver_stats'),
]
