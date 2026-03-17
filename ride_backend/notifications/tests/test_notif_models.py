import pytest
from notifications.models import Notification, NotificationPreference
from accounts.models import User


@pytest.fixture
def user():
    return User.objects.create_user(
        email="notify@test.com",
        password="testpass",
        first_name="Test",
        last_name="User"
    )


@pytest.mark.django_db
def test_create_notification(user):

    notification = Notification.objects.create(
        user=user,
        notification_type="booking_confirmed",
        title="Booking Confirmed",
        message="Your trip has been booked successfully"
    )

    assert notification.user == user
    assert notification.notification_type == "booking_confirmed"
    assert notification.is_read is False
    assert notification.is_sent_email is False


@pytest.mark.django_db
def test_notification_str(user):

    notification = Notification.objects.create(
        user=user,
        notification_type="trip_started",
        title="Trip Started",
        message="Your driver has started the trip"
    )

    assert str(notification) == f"trip_started - {user.email}"


@pytest.mark.django_db
def test_mark_notification_as_read(user):

    notification = Notification.objects.create(
        user=user,
        notification_type="general",
        title="Test",
        message="Test message"
    )

    notification.mark_as_read()
    notification.refresh_from_db()

    assert notification.is_read is True
    assert notification.read_at is not None

@pytest.mark.django_db
def test_create_notification_helper(user):

    notification = Notification.create_notification(
        user=user,
        notification_type="payment_received",
        title="Payment Received",
        message="Your payment was successful",
        trip_id=10,
        booking_id=20,
        payment_id="PAY123"
    )

    assert notification.user == user
    assert notification.related_trip_id == 10
    assert notification.related_booking_id == 20
    assert notification.related_payment_id == "PAY123"

@pytest.mark.django_db
def test_create_notification_preferences(user):

    prefs = NotificationPreference.objects.create(user=user)

    assert prefs.email_booking_updates is True
    assert prefs.sms_booking_updates is True
    assert prefs.email_marketing is False


@pytest.mark.django_db
def test_notification_preferences_str(user):

    prefs = NotificationPreference.objects.create(user=user)

    assert str(prefs) == f"Notification preferences for {user.email}"


@pytest.mark.django_db
def test_mark_as_read_only_once(user):

    notification = Notification.objects.create(
        user=user,
        notification_type="general",
        title="Test",
        message="Test message"
    )

    notification.mark_as_read()
    first_read_time = notification.read_at

    notification.mark_as_read()
    notification.refresh_from_db()

    assert notification.read_at == first_read_time
