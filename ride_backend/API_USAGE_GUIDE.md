# RideShare API Usage Guide

## Quick Start

### 1. Register a User (Passenger)

```bash
POST http://localhost:8000/api/accounts/register/
Content-Type: application/json

{
  "email": "passenger@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "passenger",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "city": "New York",
  "country": "USA"
}
```

Response:
```json
{
  "user": { ... },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Register a Driver

```bash
POST http://localhost:8000/api/accounts/register/
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "user_type": "driver",
  "phone_number": "+1234567891",
  "date_of_birth": "1985-05-15",
  "city": "Boston",
  "country": "USA"
}
```

### 3. Verify Phone Number

```bash
# Send OTP
POST http://localhost:8000/api/accounts/send-otp/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone_number": "+1234567890"
}

# Verify OTP
POST http://localhost:8000/api/accounts/verify-otp/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "otp_code": "123456"
}
```

### 4. Create Driver Profile

```bash
POST http://localhost:8000/api/drivers/profile/create/
Authorization: Bearer <driver_access_token>
Content-Type: multipart/form-data

{
  "license_number": "DL123456",
  "license_image_front": <file>,
  "license_image_back": <file>,
  "license_expiry_date": "2026-12-31",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "vehicle_year": 2022,
  "vehicle_color": "Silver",
  "license_plate": "ABC-1234",
  "total_seats": 4,
  "insurance_number": "INS123456",
  "insurance_image": <file>,
  "insurance_expiry_date": "2025-12-31",
  "years_of_experience": 8,
  "bio": "Professional driver with 8 years of experience"
}
```

### 5. Admin Verifies Driver License

```bash
POST http://localhost:8000/api/drivers/1/verify/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "license_verification_status": "approved",
  "license_verification_notes": "All documents verified successfully"
}
```

### 6. Create Route (Admin)

```bash
POST http://localhost:8000/api/drivers/routes/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "New York → Boston",
  "from_city": "New York",
  "to_city": "Boston",
  "distance_km": 350,
  "estimated_duration_minutes": 240,
  "base_price": 45.00,
  "is_active": true
}
```

### 7. Driver Creates a Trip

```bash
POST http://localhost:8000/api/trips/create/
Authorization: Bearer <driver_access_token>
Content-Type: application/json

{
  "route_id": 1,
  "from_city": "New York",
  "to_city": "Boston",
  "departure_datetime": "2026-03-20T09:00:00Z",
  "estimated_arrival_datetime": "2026-03-20T13:00:00Z",
  "price_per_seat": 45.00,
  "available_seats": 3,
  "notes": "Comfortable ride with AC"
}
```

### 8. Browse Available Trips

```bash
# List all trips
GET http://localhost:8000/api/trips/

# Filter by route
GET http://localhost:8000/api/trips/?from_city=New York&to_city=Boston

# Search and order
GET http://localhost:8000/api/trips/?search=Boston&ordering=price_per_seat
```

### 9. Passenger Books a Trip

```bash
POST http://localhost:8000/api/trips/bookings/create/
Authorization: Bearer <passenger_access_token>
Content-Type: application/json

{
  "trip_id": 1,
  "number_of_seats": 2,
  "pickup_location": "123 Main St, New York, NY",
  "pickup_notes": "Please call when you arrive"
}
```

### 10. Make Payment

```bash
POST http://localhost:8000/api/payments/create/
Authorization: Bearer <passenger_access_token>
Content-Type: application/json

{
  "booking_id": 1,
  "payment_method": "stripe",
  "stripe_payment_method_id": "pm_card_visa"
}
```

Or pay with wallet:
```bash
{
  "booking_id": 1,
  "payment_method": "wallet"
}
```

Or pay with cash:
```bash
{
  "booking_id": 1,
  "payment_method": "cash"
}
```

### 11. Driver Starts Trip

```bash
POST http://localhost:8000/api/trips/1/start/
Authorization: Bearer <driver_access_token>
```

### 12. Driver Completes Trip

```bash
POST http://localhost:8000/api/trips/1/complete/
Authorization: Bearer <driver_access_token>
```

### 13. Passenger Leaves Review

```bash
POST http://localhost:8000/api/reviews/create/
Authorization: Bearer <passenger_access_token>
Content-Type: application/json

{
  "booking": 1,
  "rating": 5,
  "punctuality_rating": 5,
  "safety_rating": 5,
  "vehicle_condition_rating": 5,
  "communication_rating": 5,
  "comment": "Excellent driver! Very professional and safe."
}
```

### 14. Check Driver Statistics

```bash
GET http://localhost:8000/api/drivers/profile/stats/
Authorization: Bearer <driver_access_token>
```

Response:
```json
{
  "total_trips": 10,
  "completed_trips": 9,
  "cancelled_trips": 1,
  "cancellation_rate": 10.0,
  "average_rating": 4.85,
  "reputation_score": 87.50,
  "total_reviews": 8,
  "verification_status": "approved",
  "can_accept_trips": true
}
```

### 15. Cancel Booking

```bash
POST http://localhost:8000/api/trips/bookings/1/cancel/
Authorization: Bearer <passenger_access_token>
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

Response:
```json
{
  "message": "Booking cancelled. Refund: $90.0",
  "refund_amount": 90.0,
  "penalty_amount": 0.0
}
```

### 16. Add Funds to Wallet

```bash
POST http://localhost:8000/api/payments/wallet/add-funds/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 100.00,
  "description": "Adding funds for upcoming trips"
}
```

### 17. Get Notifications

```bash
# Get all notifications
GET http://localhost:8000/api/notifications/
Authorization: Bearer <access_token>

# Get unread notifications
GET http://localhost:8000/api/notifications/unread/
Authorization: Bearer <access_token>

# Mark notification as read
POST http://localhost:8000/api/notifications/1/read/
Authorization: Bearer <access_token>

# Mark all as read
POST http://localhost:8000/api/notifications/mark-all-read/
Authorization: Bearer <access_token>
```

## Common Workflows

### Passenger Workflow
1. Register → Verify Phone → Browse Trips → Book Trip → Make Payment → Wait for Trip → Complete Trip → Leave Review

### Driver Workflow
1. Register → Verify Phone → Create Driver Profile → Wait for Admin Verification → Create Trip → Accept Bookings → Start Trip → Complete Trip → Receive Payment → Respond to Reviews

### Admin Workflow
1. Review Pending Driver Verifications → Approve/Reject Drivers → Monitor Trips → Handle Reports → Manage Routes

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message here",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Tokens expire after 24 hours. Use the refresh endpoint to get a new access token:
```bash
POST http://localhost:8000/api/accounts/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}
```

## Rate Limiting

Consider implementing rate limiting in production to prevent abuse.

## Webhooks

For Stripe webhook events:
```bash
POST http://localhost:8000/api/payments/stripe-webhook/
Stripe-Signature: <signature>
```

## Testing with Postman

Import the API endpoints into Postman and create an environment with:
- `base_url`: http://localhost:8000
- `access_token`: <your_token>
- `refresh_token`: <your_refresh_token>

Use `{{base_url}}/api/...` and `{{access_token}}` in your requests.
