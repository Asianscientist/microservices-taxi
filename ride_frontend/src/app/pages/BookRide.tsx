import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard,
  Car,
  Star,
  Shield,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import TripService from '../../services/trip.service';
import { useAuth } from '../../hooks/useAuth';

export function BookRide() {
  const { id } = useParams(); // trip id
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    seats: '1',
    pickupLocation: '',
    pickupNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch trip (and embedded driver) by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) throw new Error('Missing trip id');
        const tripData = await TripService.getTripDetails(parseInt(id));
        setTrip(tripData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load booking information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading booking information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Trip not found'}</p>
            <Button onClick={() => navigate('/drivers')}>
              Back to Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPrice = (Number(trip.price_per_seat) || 0) * parseInt(formData.seats || '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.seats) {
      toast.error('Please select number of seats');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        trip_id: parseInt(id || '0'),
        number_of_seats: parseInt(formData.seats),
        pickup_location: formData.pickupLocation,
        pickup_notes: formData.pickupNotes,
      };
      
      await TripService.createBooking(bookingData);
      toast.success('Booking confirmed! Check your email for confirmation.');
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/driver/${trip.driver?.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">RideShare</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Book Your Ride</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <strong>Route:</strong> {trip.from_city} → {trip.to_city}<br/>
                        <strong>Departure:</strong> {new Date(trip.departure_datetime).toLocaleString()}<br/>
                        <strong>Price:</strong> ${trip.price_per_seat} / seat<br/>
                        <strong>Available Seats:</strong> {trip.available_seats}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seats">Number of Seats *</Label>
                      <Select 
                        value={formData.seats} 
                        onValueChange={(value) => setFormData({...formData, seats: value})}
                      >
                        <SelectTrigger id="seats">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: Math.min(Number(trip.available_seats || 0), 8) }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} seat{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Pickup Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Pickup Location</Label>
                      <Input
                        id="location"
                        type="text"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                        placeholder="e.g., Central Station, Hotel Main St"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Requests or Notes</Label>
                      <Input
                        id="notes"
                        type="text"
                        value={formData.pickupNotes}
                        onChange={(e) => setFormData({...formData, pickupNotes: e.target.value})}
                        placeholder="e.g., I will be wearing a blue jacket"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        💳 Payment will be processed after the driver confirms your booking. 
                        You can pay via cash or digital payment on the day of travel.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : `Confirm Booking - $${totalPrice.toFixed(2)}`}
                </Button>
              </form>
            </div>

            {/* Booking Summary */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Driver Info */}
                  <div className="flex gap-3">
                    <img
                      src={trip.driver?.user?.profile_picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'}
                      alt={trip.driver?.user?.first_name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold">{trip.driver?.user?.first_name} {trip.driver?.user?.last_name}</h3>
                        {trip.driver?.license_verified && (
                          <Shield className="w-4 h-4 text-blue-600" fill="currentColor" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                        <span>{Number(trip.driver?.average_rating || 0).toFixed(2)}</span>
                        <span className="text-gray-500">({trip.driver?.total_trips || 0} trips)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {trip.driver?.vehicle_year} {trip.driver?.vehicle_model}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Trip Summary */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{trip.from_city}</div>
                        <div className="text-gray-400 my-1">↓</div>
                        <div className="font-medium">{trip.to_city}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(trip.departure_datetime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formData.seats} seat{formData.seats !== '1' ? 's' : ''}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per seat</span>
                      <span>${trip.price_per_seat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of seats</span>
                      <span>×{formData.seats}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Safety Notice */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-green-900">
                        <p className="font-semibold mb-1">Safe & Secure</p>
                        <p>All drivers are verified and highly rated by our community.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
