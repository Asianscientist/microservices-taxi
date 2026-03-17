import { useNavigate } from 'react-router';
import { Car, Shield, Star, TrendingUp, Users, Clock, Settings } from 'lucide-react';
import { SearchForm } from '../components/SearchForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../../hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (from: string, to: string, date: string, seats: number) => {
    navigate(`/drivers?from=${from}&to=${to}&date=${date}&seats=${seats}`);
  };

  const features = [
    {
      icon: Shield,
      title: 'Verified Drivers',
      description: 'All drivers are thoroughly verified with background checks and licenses'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Transparent reviews and ratings ensure quality service and accountability'
    },
    {
      icon: TrendingUp,
      title: 'Smart Matching',
      description: 'AI-powered system matches you with the highest-rated drivers first'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your ride status and driver location'
    },
    {
      icon: Users,
      title: 'Safe & Social',
      description: 'Share rides with verified passengers and build a trusted community'
    },
    {
      icon: Car,
      title: 'Quality Vehicles',
      description: 'Modern, clean, and well-maintained vehicles for your comfort'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RideShare</span>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/drivers')}>
                Browse Trips
              </Button>
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                My Bookings
              </Button>
              {user?.user_type === 'admin' && (
                <Button variant="ghost" onClick={() => navigate('/admin')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              {!user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                >
                  Logout
                </Button>
              )}
              <Button onClick={() => navigate('/drivers')}>
                Book a Ride
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Safe, Verified Inter-City Rides
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book rides with trusted, highly-rated drivers. AI-powered matching ensures you get the best experience every time.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <SearchForm onSearch={handleSearch} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">2,500+</div>
              <div className="text-sm text-gray-600">Verified Drivers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">50,000+</div>
              <div className="text-sm text-gray-600">Completed Trips</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">98%</div>
              <div className="text-sm text-gray-600">Safety Score</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose RideShare?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of satisfied travelers who trust our platform for safe, reliable inter-city rides.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/drivers')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Browse Available Drivers
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-6 h-6" />
            <span className="text-xl font-bold">RideShare</span>
          </div>
          <p className="text-gray-400">
            Safe, verified, and efficient inter-city ride sharing.
          </p>
        </div>
      </footer>
    </div>
  );
}
