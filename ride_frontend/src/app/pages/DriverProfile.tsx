import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Star, 
  MapPin, 
  Car, 
  Shield, 
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { ReviewCard } from '../components/ReviewCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import DriverService from '../../services/driver.service';

export function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<any>(null);
  const [driverReviews, setDriverReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Missing driver id');

        const driverId = parseInt(id);
        const [driverData, reviewsData, statsData] = await Promise.all([
          DriverService.getDriverById(driverId),
          DriverService.getDriverReviews(driverId),
          DriverService.getDriverRatingStats(driverId),
        ]);

        const reviewsList = Array.isArray(reviewsData) ? reviewsData : reviewsData.results || reviewsData.data || [];
        if (!cancelled) {
          setDriver(driverData);
          setDriverReviews(reviewsList);
          setRatingStats(statsData);
        }
      } catch (e) {
        console.error('Failed to load driver profile', e);
        if (!cancelled) setError('Failed to load driver profile. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading driver profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Driver Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'Driver not found'}</p>
            <Button onClick={() => navigate('/drivers')}>
              Back to Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const driverName = driver.user?.first_name && driver.user?.last_name
    ? `${driver.user.first_name} ${driver.user.last_name}`
    : driver.user_name || 'Driver';
  const driverPhoto = driver.user?.profile_picture || driver.user_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
  const rating = Number(driver.average_rating || ratingStats?.average_rating || 0);
  const totalTrips = Number(driver.total_trips || 0);

  const ratingDistribution = useMemo(() => {
    const dist = ratingStats?.rating_distribution;
    const total = Number(ratingStats?.total_reviews || driverReviews.length || 0);
    return [5, 4, 3, 2, 1].map((r) => {
      const count = dist ? Number(dist[String(r)] || 0) : driverReviews.filter((x) => Number(x.rating) === r).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { rating: r, count, percentage };
    });
  }, [ratingStats, driverReviews]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/drivers')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drivers
            </Button>
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">RideShare</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Driver Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={driverPhoto}
                    alt={driverName}
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-3xl font-bold">{driverName}</h1>
                          {driver.license_verified && (
                            <Shield className="w-6 h-6 text-blue-600" fill="currentColor" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                            <span className="text-xl font-bold">{rating.toFixed(2)}</span>
                          </div>
                          <span className="text-gray-500">
                            ({totalTrips} trips)
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{driver.bio || ''}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span>
                          {driver.vehicle_year} {driver.vehicle_model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{driver.years_of_experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>Plate: {driver.license_plate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Verified Driver</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold">Available Routes</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(driver.available_routes || []).map((route: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {route?.name || `${route?.from_city || ''} → ${route?.to_city || ''}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({driverReviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rating Distribution */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{rating.toFixed(1)}</div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {driverReviews.length} reviews
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-8">{rating} ★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Review List */}
                <div className="space-y-4">
                  {driverReviews.length > 0 ? (
                    driverReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No reviews yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-gray-600">
                    Pricing depends on the selected trip.
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Seats</span>
                    <span className="font-semibold">Varies</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Trips</span>
                    <span className="font-semibold">{totalTrips}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{driver.years_of_experience} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">~10 mins</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate('/drivers')}
                  >
                    Browse Trips
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/drivers')}
                  >
                    View Available Trips
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        Safe & Verified
                      </p>
                      <p className="text-blue-700">
                        This driver has passed all background checks and maintains a high rating.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
