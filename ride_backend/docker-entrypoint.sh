#!/bin/bash
set -e

echo "Starting Django application..."

# Wait for database to be available
echo "Waiting for database..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is available"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting Gunicorn..."
exec gunicorn rideshare.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 60
