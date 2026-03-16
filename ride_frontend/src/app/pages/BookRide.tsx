import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { drivers } from '../data/mockData';
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
import { cities } from '../data/mockData';
import { toast } from 'sonner';

export function BookRide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const driver = drivers.find(d => d.id === id);

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    seats: '1',
    name: '',
    phone: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const totalPrice = driver.pricePerSeat * parseInt(formData.seats || '1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.date || !formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.from === formData.to) {
      toast.error('Departure and destination cities must be different');
      return;
    }

    setIsSubmitting(true);

    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Booking confirmed! You will receive a confirmation email shortly.');
    
    setTimeout(() => {
      navigate('/bookings');
    }, 2000);
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
              onClick={() => navigate(`/driver/${driver.id}`)}
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
                {/* Trip Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trip Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from">From *</Label>
                        <Select 
                          value={formData.from} 
                          onValueChange={(value) => setFormData({...formData, from: value})}
                        >
                          <SelectTrigger id="from">
                            <SelectValue placeholder="Select departure city" />
                          </SelectTrigger>
                          <SelectContent>
                            {driver.routes.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="to">To *</Label>
                        <Select 
                          value={formData.to} 
                          onValueChange={(value) => setFormData({...formData, to: value})}
                        >
                          <SelectTrigger id="to">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {driver.routes.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className="pl-10"
                          />
                        </div>
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
                            {Array.from({ length: Math.min(driver.availableSeats, 4) }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} seat{num > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Passenger Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Passenger Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com"
                        />
                      </div>
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
                  {isSubmitting ? 'Processing...' : `Confirm Booking - $${totalPrice}`}
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
                      src={driver.photo}
                      alt={driver.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold">{driver.name}</h3>
                        {driver.verified && (
                          <Shield className="w-4 h-4 text-blue-600" fill="currentColor" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                        <span>{driver.rating.toFixed(2)}</span>
                        <span className="text-gray-500">({driver.totalTrips} trips)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {driver.vehicleYear} {driver.vehicleModel}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Trip Summary */}
                  <div className="space-y-3">
                    {formData.from && formData.to && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">{formData.from}</div>
                          <div className="text-gray-400 my-1">↓</div>
                          <div className="font-medium">{formData.to}</div>
                        </div>
                      </div>
                    )}

                    {formData.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(formData.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

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
                      <span>${driver.pricePerSeat}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of seats</span>
                      <span>×{formData.seats}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">${totalPrice}</span>
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
