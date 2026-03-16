import { Star, MapPin, Car, Shield } from 'lucide-react';
import { Driver } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img
            src={driver.photo}
            alt={driver.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{driver.name}</h3>
                  {driver.verified && (
                    <Shield className="w-4 h-4 text-blue-600" fill="currentColor" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="font-medium">{driver.rating.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">
                    ({driver.totalTrips} trips)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${driver.pricePerSeat}
                </div>
                <div className="text-sm text-gray-500">per seat</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Car className="w-4 h-4" />
              <span>
                {driver.vehicleYear} {driver.vehicleModel}
              </span>
              <span className="text-gray-400">•</span>
              <span>{driver.yearsExperience} years exp.</span>
            </div>

            <div className="mt-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {driver.routes.map((route, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {route}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => navigate(`/driver/${driver.id}`)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                View Profile
              </Button>
              <Button
                onClick={() => navigate(`/book/${driver.id}`)}
                size="sm"
                className="flex-1"
              >
                Book Ride
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
