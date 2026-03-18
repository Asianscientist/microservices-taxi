import pytest
from accounts.models import User

@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(
        email="test@example.com",
        password="securepass123",
        first_name="John",
        last_name="Doe"
    )

    assert user.email == "test@example.com"
    assert user.check_password("securepass123")
    assert user.user_type == "passenger"
    assert user.is_suspended is False

@pytest.mark.django_db
def test_user_str_representation():
    user = User.objects.create_user(
        email="john@example.com",
        password="password",
        first_name="John",
        last_name="Doe"
    )

    assert str(user) == "John Doe (john@example.com)"


@pytest.mark.django_db
def test_default_penalty_values():

    user = User.objects.create_user(
        email="penalty@test.com",
        password="testpass",
        first_name="Penalty",
        last_name="User"
    )

    assert user.no_show_count == 0
    assert user.total_penalty_amount == 0
    assert user.is_suspended is False

from django.conf import settings

@pytest.mark.django_db
def test_add_no_show_penalty(settings):

    settings.PENALTY_FEES = {
        "PASSENGER_NO_SHOW": 10
    }

    settings.CANCELLATION_LIMITS = {
        "PASSENGER_MAX_NO_SHOWS_PER_MONTH": 3
    }

    user = User.objects.create_user(
        email="noshow@test.com",
        password="testpass",
        first_name="Test",
        last_name="User"
    )

    user.add_no_show_penalty()

    user.refresh_from_db()

    assert user.no_show_count == 1
    assert user.total_penalty_amount == 10
    assert user.is_suspended is False

@pytest.mark.django_db
def test_user_suspension_after_limit(settings):

    settings.PENALTY_FEES = {
        "PASSENGER_NO_SHOW": 10
    }

    settings.CANCELLATION_LIMITS = {
        "PASSENGER_MAX_NO_SHOWS_PER_MONTH": 2
    }

    user = User.objects.create_user(
        email="limit@test.com",
        password="testpass",
        first_name="Limit",
        last_name="User"
    )

    user.add_no_show_penalty()
    user.add_no_show_penalty()

    user.refresh_from_db()

    assert user.no_show_count == 2
    assert user.is_suspended is True
    assert "Exceeded maximum no-shows" in user.suspension_reason


from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
def test_monthly_penalty_reset():

    user = User.objects.create_user(
        email="reset@test.com",
        password="pass",
        first_name="Reset",
        last_name="User"
    )

    user.no_show_count = 5
    user.last_no_show_reset = timezone.now() - timedelta(days=31)
    user.save()

    user.reset_monthly_penalties()

    user.refresh_from_db()

    assert user.no_show_count == 0