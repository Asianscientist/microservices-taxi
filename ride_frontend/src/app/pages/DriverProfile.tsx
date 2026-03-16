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
import { drivers, reviews } from '../data/mockData';
import { ReviewCard } from '../components/ReviewCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driver = drivers.find(d => d.id === id);
  const driverReviews = reviews.filter(r => r.driverId === id);

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Driver Not Found</h2>
            <Button onClick={() => navigate('/drivers')}>
              Back to Drivers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = driverReviews.filter(r => r.rating === rating).length;
    const percentage = driverReviews.length > 0 ? (count / driverReviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

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
                    src={driver.photo}
                    alt={driver.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-3xl font-bold">{driver.name}</h1>
                          {driver.verified && (
                            <Shield className="w-6 h-6 text-blue-600" fill="currentColor" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                            <span className="text-xl font-bold">{driver.rating.toFixed(2)}</span>
                          </div>
                          <span className="text-gray-500">
                            ({driver.totalTrips} trips)
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{driver.bio}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span>
                          {driver.vehicleYear} {driver.vehicleModel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{driver.yearsExperience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>License: {driver.licensePlate}</span>
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
                    {driver.routes.map((route, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {route}
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
                      <div className="text-4xl font-bold">{driver.rating.toFixed(1)}</div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(driver.rating) ? 'text-yellow-500' : 'text-gray-300'
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
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    ${driver.pricePerSeat}
                  </div>
                  <div className="text-gray-600">per seat</div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Seats</span>
                    <span className="font-semibold">{driver.availableSeats}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Trips</span>
                    <span className="font-semibold">{driver.totalTrips}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{driver.yearsExperience} years</span>
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
                    onClick={() => navigate(`/book/${driver.id}`)}
                  >
                    Book This Driver
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/drivers')}
                  >
                    View Other Drivers
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
