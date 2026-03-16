# RideShare Backend API

A comprehensive Django REST Framework backend for an inter-city ride-sharing platform with AI-powered matching, reputation system, and secure payment processing.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Phone number verification via OTP (Twilio)
- User roles: Passenger, Driver, Admin
- Activity logging

### 🚗 Driver Management
- Driver profile creation with license verification
- Admin verification workflow for driver licenses
- Reputation scoring system based on:
  - Rating (50% weight)
  - Completed trips (30% weight)
  - Low cancellation rate (20% weight)
- Driver availability management
- Document upload and verification

### 🛣️ Trip Management
- Create and manage trips
- Real-time trip tracking
- Trip status management (pending, confirmed, in_progress, completed, cancelled)
- Smart matching prioritizing high-reputation drivers

### 📅 Booking System
- Create and manage bookings
- Cancellation policies with penalties
- Late cancellation fees
- No-show tracking and penalties
- Booking confirmation after payment

### 💰 Payment System
- Escrow-based payment system
- Multiple payment methods (Stripe, Wallet, Cash)
- Platform fee calculation
- Automatic driver payouts after trip completion
- Refund processing
- Wallet system for users

### ⭐ Review & Rating System
- Detailed reviews with multiple rating categories:
  - Overall rating
  - Punctuality
  - Safety
  - Vehicle condition
  - Communication
- Review responses from drivers
- Review reporting and moderation
- Automated reputation score updates

### 🔔 Notification System
- In-app notifications
- Email notifications
- SMS notifications (Twilio)
- Customizable notification preferences
- Real-time notification counts

### 🚨 Safety & Compliance
- Driver license verification by admins
- Background check document upload
- Insurance verification
- Cancellation tracking and limits:
  - Max 3 driver cancellations per month
  - Max 2 passenger no-shows per month
- Automatic suspension for policy violations
- Penalty system:
  - $5 for passenger no-show
  - $2.50 for late cancellations (within 2 hours)

## Installation

### Prerequisites
- Python 3.9+
- PostgreSQL
- Redis (for Celery)

### Setup

1. **Clone the repository and navigate to backend**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment Configuration**
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see Configuration section below).

5. **Database Setup**
```bash
# Create PostgreSQL database
createdb rideshare_db

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

6. **Create Superuser**
```bash
python manage.py createsuperuser
```

7. **Run Development Server**
```bash
python manage.py runserver
```

8. **Run Celery Worker** (in separate terminal)
```bash
celery -A rideshare worker -l info
```

## Configuration

### Environment Variables (.env)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=rideshare_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Twilio (for OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@rideshare.com
```

## API Documentation

Once the server is running, access the API documentation at:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - Register new user
- `POST /api/accounts/login/` - Login
- `POST /api/accounts/logout/` - Logout
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `POST /api/accounts/send-otp/` - Send OTP for phone verification
- `POST /api/accounts/verify-otp/` - Verify OTP

### Driver Management
- `POST /api/drivers/profile/create/` - Create driver profile
- `GET /api/drivers/` - List all verified drivers
- `GET /api/drivers/{id}/` - Get driver details
- `POST /api/drivers/{id}/verify/` - Verify driver (admin only)
- `GET /api/drivers/pending-verifications/` - List pending verifications (admin)

### Trips
- `GET /api/trips/` - List available trips
- `POST /api/trips/create/` - Create trip (driver only)
- `GET /api/trips/{id}/` - Get trip details
- `POST /api/trips/{id}/start/` - Start trip (driver)
- `POST /api/trips/{id}/complete/` - Complete trip (driver)

### Bookings
- `POST /api/trips/bookings/create/` - Create booking
- `GET /api/trips/bookings/` - List user bookings
- `POST /api/trips/bookings/{id}/cancel/` - Cancel booking
- `POST /api/trips/bookings/{id}/confirm/` - Confirm booking
- `POST /api/trips/bookings/{id}/no-show/` - Mark no-show (driver)

### Payments
- `POST /api/payments/create/` - Create payment
- `GET /api/payments/` - List payments
- `GET /api/payments/wallet/` - Get wallet details
- `POST /api/payments/wallet/add-funds/` - Add funds to wallet

### Reviews
- `POST /api/reviews/create/` - Create review
- `GET /api/reviews/driver/{id}/` - Get driver reviews
- `GET /api/reviews/driver/{id}/stats/` - Get driver rating stats
- `POST /api/reviews/responses/create/` - Respond to review (driver)

### Notifications
- `GET /api/notifications/` - List notifications
- `GET /api/notifications/unread/` - List unread notifications
- `POST /api/notifications/{id}/read/` - Mark as read
- `GET /api/notifications/stats/` - Get notification stats

## Business Rules

### Reputation System
The reputation score is calculated using weighted factors:
- **Rating** (50%): Average star rating from reviews
- **Completed Trips** (30%): Number of successfully completed trips
- **Cancellation Rate** (20%): Inverse of cancellation rate

### Cancellation Policies
- **Driver Cancellations**: Max 3 per month, automatic suspension if exceeded
- **Passenger No-Shows**: Max 2 per month, automatic suspension if exceeded
- **Late Cancellation**: Within 2 hours of departure incurs $2.50 penalty
- **Regular Cancellation**: Full refund if cancelled early enough

### Penalty Fees
- **Passenger No-Show**: $5.00
- **Late Cancellation**: $2.50
- **Driver Cancellation**: No fee, but affects reputation

### Payment Flow
1. Passenger books ride
2. Payment is processed and held in escrow
3. Trip is confirmed
4. Trip starts
5. Trip completes
6. Payment is released to driver (minus platform fee)
7. Passenger can leave review

## Testing

Run tests with:
```bash
python manage.py test
```

## Production Deployment

### Security Checklist
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure HTTPS
- [ ] Set up proper CORS origins
- [ ] Use environment variables for sensitive data
- [ ] Enable Django security middleware
- [ ] Set up database backups
- [ ] Configure Celery with proper broker
- [ ] Set up monitoring and logging

### Additional Setup
- Configure Gunicorn or uWSGI
- Set up Nginx reverse proxy
- Configure SSL certificates
- Set up CDN for static files
- Configure Redis for caching
- Set up Sentry for error tracking

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact the development team.
