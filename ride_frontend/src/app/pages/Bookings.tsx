import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Car,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Loader
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TripService from '../../services/trip.service';
import { toast } from 'sonner';

export function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await TripService.getBookings();
        
        // Handle both paginated and non-paginated responses
        const bookingsList = Array.isArray(response) ? response : response.results || response.data || [];
        setBookings(bookingsList);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId: number) => {
    try {
      await TripService.cancelBooking(bookingId);
      toast.success('Booking cancelled');
      const refreshed = await TripService.getBookings();
      const list = Array.isArray(refreshed) ? refreshed : refreshed.results || refreshed.data || [];
      setBookings(list);
    } catch (e) {
      console.error('Cancel booking error', e);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return null;
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => {
    const driverName = booking.trip?.driver?.user?.first_name && booking.trip?.driver?.user?.last_name
      ? `${booking.trip.driver.user.first_name} ${booking.trip.driver.user.last_name}`
      : booking.trip?.driver?.user?.email || 'Unknown Driver';
    
    const driverRating = booking.trip?.driver?.average_rating || 0;
    const driverPhoto = booking.trip?.driver?.user?.profile_picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
    const vehicleInfo = `${booking.trip?.driver?.vehicle_year || ''} ${booking.trip?.driver?.vehicle_model || ''}`.trim();

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <img
              src={driverPhoto}
              alt={driverName}
              className="w-20 h-20 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
              }}
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{driverName}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    <span>{driverRating.toFixed(2)}</span>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="text-sm">
                    <div className="font-medium">{booking.trip?.from_city}</div>
                    <div className="text-gray-400 my-0.5">↓</div>
                    <div className="font-medium">{booking.trip?.to_city}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(booking.trip?.departure_datetime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{booking.number_of_seats} seat{booking.number_of_seats > 1 ? 's' : ''}</span>
                  </div>
                  {vehicleInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span>{vehicleInfo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">
                  ${booking.total_amount?.toFixed(2) || '0.00'}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/driver/${booking.trip?.driver?.id}`)}
                  >
                    View Driver
                  </Button>
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => cancelBooking(Number(booking.id))}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Car className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold">RideShare</span>
              </div>
            </div>
            <Button onClick={() => navigate('/drivers')}>
              Book New Ride
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading your bookings...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-red-600">Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your journey by booking a ride with one of our verified drivers
                </p>
                <Button onClick={() => navigate('/drivers')}>
                  Browse Drivers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No upcoming bookings</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No past bookings</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
