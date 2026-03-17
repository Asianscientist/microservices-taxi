import { Star, MapPin, Car, Shield } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface DriverCardProps {
  driver: any;
}

export function DriverCard({ driver }: DriverCardProps) {
  const navigate = useNavigate();
  
  // Map backend fields to component fields
  const driverName = driver.user?.first_name && driver.user?.last_name 
    ? `${driver.user.first_name} ${driver.user.last_name}` 
    : driver.name || 'Driver';
  
  const profilePicture = driver.user?.profile_picture || driver.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
  const rating = driver.average_rating || driver.rating || 0;
  const totalTrips = driver.total_trips || driver.totalTrips || 0;
  const pricePerSeat = driver.price_per_seat || driver.pricePerSeat || 'N/A';
  const vehicleYear = driver.vehicle_year || driver.vehicleYear || '';
  const vehicleModel = driver.vehicle_model || driver.vehicleModel || '';
  const yearsExperience = driver.years_of_experience || driver.yearsExperience || 0;
  const isVerified = driver.is_verified || driver.verified || false;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img
            src={profilePicture}
            alt={driverName}
            className="w-20 h-20 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
            }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{driverName}</h3>
                  {isVerified && (
                    <Shield className="w-4 h-4 text-blue-600" fill="currentColor" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="font-medium">{rating.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">
                    ({totalTrips} trips)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${typeof pricePerSeat === 'number' ? pricePerSeat : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">per seat</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Car className="w-4 h-4" />
              <span>
                {vehicleYear && vehicleModel ? `${vehicleYear} ${vehicleModel}` : 'Vehicle info not available'}
              </span>
              {yearsExperience > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{yearsExperience} years exp.</span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Available for trips</span>
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
