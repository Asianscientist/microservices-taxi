# Backend Installation Guide

## Quick Installation Steps

### 1. Prerequisites

Make sure you have the following installed:
- Python 3.9 or higher
- PostgreSQL 12 or higher
- Redis (for Celery tasks)
- pip (Python package installer)

### 2. Database Setup

```bash
# Install PostgreSQL (if not installed)
# On macOS with Homebrew:
brew install postgresql@14
brew services start postgresql@14

# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
psql postgres
CREATE DATABASE rideshare_db;
CREATE USER rideshare_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rideshare_db TO rideshare_user;
\q
```

### 3. Redis Setup

```bash
# On macOS with Homebrew:
brew install redis
brew services start redis

# On Ubuntu/Debian:
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 4. Python Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 5. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Important settings to configure:**
- `SECRET_KEY`: Generate a new secret key
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Your PostgreSQL credentials
- `TWILIO_*`: Your Twilio credentials for SMS OTP (optional for development)
- `STRIPE_*`: Your Stripe credentials for payments (optional for development)

### 6. Django Setup

```bash
# Make migrations
python manage.py makemigrations accounts
python manage.py makemigrations drivers
python manage.py makemigrations trips
python manage.py makemigrations payments
python manage.py makemigrations reviews
python manage.py makemigrations notifications
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser
# Enter email, password, and other details when prompted

# Collect static files (for production)
python manage.py collectstatic --noinput
```

### 7. Run the Server

```bash
# Development server
python manage.py runserver

# The API will be available at:
# http://localhost:8000/api/
# Admin panel: http://localhost:8000/admin/
# API Documentation: http://localhost:8000/api/docs/
```

### 8. Run Celery Worker (Optional - for background tasks)

In a separate terminal:
```bash
# Activate virtual environment
source venv/bin/activate

# Start Celery worker
celery -A rideshare worker -l info

# Start Celery beat (for scheduled tasks) in another terminal
celery -A rideshare beat -l info
```

## Verification

### Test the Installation

1. **Access Admin Panel**
   - Go to http://localhost:8000/admin/
   - Login with superuser credentials
   - You should see all the models

2. **Access API Documentation**
   - Go to http://localhost:8000/api/docs/
   - You should see Swagger UI with all endpoints

3. **Test User Registration**
```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "passenger"
  }'
```

## Common Issues and Solutions

### Issue: Database Connection Error

**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l`

### Issue: Redis Connection Error

**Solution:**
- Verify Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis URL in `.env`

### Issue: Module Import Errors

**Solution:**
```bash
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Issue: Migration Errors

**Solution:**
```bash
# Reset migrations (WARNING: This deletes all data)
python manage.py migrate --fake app_name zero
python manage.py makemigrations
python manage.py migrate
```

### Issue: Static Files Not Loading

**Solution:**
```bash
python manage.py collectstatic --clear --noinput
```

## Development vs Production

### Development Mode (Current)
- `DEBUG=True`
- SQLite or local PostgreSQL
- Development server (`runserver`)
- Console email backend

### Production Mode
- `DEBUG=False`
- Production PostgreSQL database
- Gunicorn/uWSGI + Nginx
- Real email backend (SendGrid, AWS SES, etc.)
- HTTPS enabled
- Environment variables secured
- Proper logging configuration
- Sentry error tracking

## Next Steps

1. **Create Sample Data**
   - Login to admin panel
   - Create some routes (e.g., New York → Boston)
   - Create driver profiles
   - Approve driver licenses

2. **Test API Endpoints**
   - Use Postman or curl to test endpoints
   - Refer to `API_USAGE_GUIDE.md` for examples

3. **Configure External Services** (Optional)
   - Set up Twilio for SMS OTP
   - Set up Stripe for payments
   - Configure email service (Gmail, SendGrid, etc.)

4. **Connect Frontend**
   - Update frontend API base URL to `http://localhost:8000/api/`
   - Test full integration

## Getting Help

- Check `README.md` for detailed feature documentation
- Check `API_USAGE_GUIDE.md` for API examples
- Review Django documentation: https://docs.djangoproject.com/
- Review DRF documentation: https://www.django-rest-framework.org/

## Useful Commands

```bash
# Create new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Django shell
python manage.py shell

# Show current migrations
python manage.py showmigrations

# Database shell
python manage.py dbshell
```

## Security Checklist Before Production

- [ ] Change SECRET_KEY to a strong random value
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS properly
- [ ] Use HTTPS only
- [ ] Secure database credentials
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Set up proper logging
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Review and update security middleware
