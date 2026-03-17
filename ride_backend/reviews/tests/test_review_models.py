import pytest
from reviews.models import Review, ReviewResponse, ReviewReport, DriverRating
from drivers.models import DriverProfile, Route
from trips.models import Trip, Booking
from accounts.models import User
from django.utils import timezone
from datetime import timedelta

@pytest.fixture
def passenger():
    return User.objects.create_user(
        email="passenger@test.com",
        password="testpass",
        first_name="Passenger",
        last_name="User"
    )

@pytest.fixture
def driver_user():
    return User.objects.create_user(
        email="driver@test.com",
        password="testpass",
        first_name="Driver",
        last_name="User"
    )

@pytest.fixture
def driver(driver_user):
    return DriverProfile.objects.create(
        user=driver_user,
        license_number="TEST123",
        license_image_front="front.jpg",
        license_image_back="back.jpg",
        license_expiry_date="2030-01-01",
        vehicle_make="Toyota",
        vehicle_model="Camry",
        vehicle_year=2022,
        vehicle_color="Black",
        license_plate="TESTCAR",
        total_seats=4,
        insurance_number="INS123",
        insurance_image="insurance.jpg",
        insurance_expiry_date="2030-01-01",
        years_of_experience=5
    )

@pytest.fixture
def route():
    return Route.objects.create(
        name="Route A-B",
        from_city="City A",
        to_city="City B",
        distance_km=100.0,
        estimated_duration_minutes=120,
        base_price=50.0
    )

@pytest.fixture
def trip(driver, route):
    now = timezone.now()
    return Trip.objects.create(
        driver=driver,
        route=route,
        from_city="City A",
        to_city="City B",
        departure_datetime=now + timedelta(days=1),
        estimated_arrival_datetime=now + timedelta(days=1, hours=2),
        price_per_seat=50.0,
        total_seats=4,
        available_seats=4,
        status="completed"
    )

@pytest.fixture
def booking(passenger, trip):
    return Booking.objects.create(
        trip=trip,
        passenger=passenger,
        number_of_seats=1,
        price_per_seat=50.0,
        total_amount=50.0,
        status="completed"
    )

# Example test
@pytest.mark.django_db
def test_create_review(passenger, driver, booking):
    review = Review.objects.create(
        booking=booking,
        reviewer=passenger,
        reviewed_driver=driver,
        rating=5,
        comment="Great trip!"
    )
    assert review.rating == 5
    assert review.reviewed_driver == driver