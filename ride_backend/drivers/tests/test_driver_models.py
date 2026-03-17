import pytest
from django.utils import timezone
from datetime import timedelta
from drivers.models import DriverProfile, Route, DriverAvailability
from accounts.models import User

@pytest.fixture
def user():
    return User.objects.create_user(
        email="driver@test.com",
        password="testpass",
        first_name="John",
        last_name="Driver"
    )

@pytest.mark.django_db
def test_create_route():

    route = Route.objects.create(
        name="City Route",
        from_city="Tashkent",
        to_city="Samarkand",
        distance_km=300,
        estimated_duration_minutes=240,
        base_price=25
    )

    assert route.from_city == "Tashkent"
    assert route.to_city == "Samarkand"

@pytest.mark.django_db
def test_create_driver_profile(user):

    driver = DriverProfile.objects.create(
        user=user,
        license_number="ABC12345",
        license_image_front="test.jpg",
        license_image_back="test.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Toyota",
        vehicle_model="Camry",
        vehicle_year=2022,
        vehicle_color="Black",
        license_plate="01ABC123",
        total_seats=4,
        insurance_number="INS123",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=5
    )

    assert driver.vehicle_make == "Toyota"
    assert driver.total_seats == 4
    assert driver.is_active is False


@pytest.mark.django_db
def test_reputation_score_calculation(user, settings):

    settings.REPUTATION_WEIGHTS = {
        "RATING": 0.5,
        "COMPLETED_TRIPS": 0.3,
        "CANCELLATION_RATE": 0.2
    }

    driver = DriverProfile.objects.create(
        user=user,
        license_number="ABC999",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Honda",
        vehicle_model="Civic",
        vehicle_year=2021,
        vehicle_color="White",
        license_plate="XYZ123",
        total_seats=4,
        insurance_number="INS999",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=3,
        average_rating=4.5,
        total_trips=100,
        completed_trips=90,
        cancelled_trips=10
    )

    score = driver.calculate_reputation_score()

    assert score > 0


@pytest.mark.django_db
def test_driver_suspension_after_cancellations(user, settings):

    settings.CANCELLATION_LIMITS = {
        "DRIVER_MAX_CANCELLATIONS_PER_MONTH": 2
    }

    settings.REPUTATION_WEIGHTS = {
        "RATING": 0.5,
        "COMPLETED_TRIPS": 0.3,
        "CANCELLATION_RATE": 0.2
    }

    driver = DriverProfile.objects.create(
        user=user,
        license_number="ABC555",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="BMW",
        vehicle_model="X5",
        vehicle_year=2020,
        vehicle_color="Black",
        license_plate="AAA555",
        total_seats=4,
        insurance_number="INS555",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=5
    )

    driver.add_cancellation()
    driver.add_cancellation()

    driver.refresh_from_db()

    assert driver.is_suspended is True


@pytest.mark.django_db
def test_monthly_cancellation_reset(user):

    driver = DriverProfile.objects.create(
        user=user,
        license_number="RESET123",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Audi",
        vehicle_model="A4",
        vehicle_year=2022,
        vehicle_color="Blue",
        license_plate="RESET1",
        total_seats=4,
        insurance_number="INSRESET",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=4,
        cancellation_count_monthly=5,
        last_cancellation_reset=timezone.now() - timedelta(days=31)
    )

    driver.reset_monthly_cancellations()

    driver.refresh_from_db()

    assert driver.cancellation_count_monthly == 0


@pytest.mark.django_db
def test_can_accept_trips(user):

    driver = DriverProfile.objects.create(
        user=user,
        license_number="TRIP123",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Tesla",
        vehicle_model="Model 3",
        vehicle_year=2023,
        vehicle_color="White",
        license_plate="TES123",
        total_seats=4,
        insurance_number="INS123",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=5,
        is_active=True,
        license_verified=True,
        license_verification_status="approved",
        is_available=True
    )

    assert driver.can_accept_trips() is True

@pytest.mark.django_db
def test_driver_availability(user):

    driver = DriverProfile.objects.create(
        user=user,
        license_number="AV123",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Toyota",
        vehicle_model="Corolla",
        vehicle_year=2020,
        vehicle_color="Gray",
        license_plate="AV123",
        total_seats=4,
        insurance_number="INSAV",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=3
    )

    availability = DriverAvailability.objects.create(
        driver=driver,
        day_of_week=0,
        start_time="08:00",
        end_time="18:00"
    )

    assert availability.day_of_week == 0