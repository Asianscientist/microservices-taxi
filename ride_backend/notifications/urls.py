from django.urls import path
from .views import (
    NotificationListView,
    UnreadNotificationListView,
    NotificationDetailView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    NotificationPreferenceView,
    NotificationStatsView,
)

app_name = 'notifications'

urlpatterns = [
    path('', NotificationListView.as_view(), name='list'),
    path('unread/', UnreadNotificationListView.as_view(), name='unread'),
    path('stats/', NotificationStatsView.as_view(), name='stats'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='detail'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
    path('preferences/', NotificationPreferenceView.as_view(), name='preferences'),
]
