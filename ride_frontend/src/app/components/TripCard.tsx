import { Star, MapPin, Car, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface TripCardProps {
  trip: any;
}

function formatDateTime(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate();

  const driverName = trip.driver_name || trip.driver?.user_name || 'Driver';
  const driverRating = Number(trip.driver_rating ?? trip.driver?.average_rating ?? 0);
  const driverId = trip.driver_id ?? trip.driver?.id;
  const fromCity = trip.from_city || '';
  const toCity = trip.to_city || '';
  const pricePerSeat = Number(trip.price_per_seat ?? 0);
  const availableSeats = Number(trip.available_seats ?? trip.available_seats_count ?? 0);
  const departure = formatDateTime(trip.departure_datetime);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{fromCity} → {toCity}</h3>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{departure}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{availableSeats} seat{availableSeats === 1 ? '' : 's'} available</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <Car className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{driverName}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span>{driverRating.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{fromCity} to {toCity}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${Number.isFinite(pricePerSeat) ? pricePerSeat : 0}
              </div>
              <div className="text-sm text-gray-500">per seat</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/book/${trip.id}`)}
              size="sm"
              className="flex-1"
              disabled={!trip?.id}
            >
              Book This Trip
            </Button>
            <Button
              onClick={() => {
                if (driverId) navigate(`/driver/${driverId}`);
              }}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!driverId}
            >
              View Driver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

