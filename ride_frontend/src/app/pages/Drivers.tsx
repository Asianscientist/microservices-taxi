import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Car, SlidersHorizontal, ArrowLeft, Loader } from 'lucide-react';
import { DriverCard } from '../components/DriverCard';
import { SearchForm } from '../components/SearchForm';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import DriverService from '../../services/driver.service';
import TripService from '../../services/trip.service';

export function Drivers() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState([4.0]);
  const [maxPrice, setMaxPrice] = useState([50]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const seats = searchParams.get('seats');

  // Fetch drivers on component mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await DriverService.listDrivers({
          is_available: true,
        });
        
        // Handle both paginated and non-paginated responses
        const driversList = Array.isArray(response) ? response : response.results || response.data || [];
        
        setDrivers(driversList);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers. Please try again.');
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    if (!drivers || drivers.length === 0) return [];
    
    let result = [...drivers];

    // Filter by rating
    result = result.filter(driver => {
      const rating = driver.average_rating || driver.rating || 0;
      return rating >= minRating[0];
    });

    // Filter by price
    result = result.filter(driver => {
      // This will need adjustment based on actual backend trip pricing
      return true; // Placeholder - filter by actual price from trips
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0);
        case 'price-low':
          return 0; // Will be sorted by trip price
        case 'price-high':
          return 0; // Will be sorted by trip price
        case 'trips':
          return (b.total_trips || b.totalTrips || 0) - (a.total_trips || a.totalTrips || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [drivers, sortBy, minRating]);

  const handleSearch = (from: string, to: string, date: string, seats: number) => {
    navigate(`/drivers?from=${from}&to=${to}&date=${date}&seats=${seats}`);
  };

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
            <Button variant="outline" onClick={() => navigate('/bookings')}>
              My Bookings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} compact />
        </div>

        {/* Search Results Info */}
        {(from || to) && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {from && to
                ? `Drivers from ${from} to ${to}`
                : from
                ? `Drivers from ${from}`
                : `Drivers to ${to}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="trips">Most Trips</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Rating: {minRating[0].toFixed(1)}</Label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    min={0}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Price per Seat: ${maxPrice[0]}</Label>
                  <Slider
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    min={20}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMinRating([4.0]);
                    setMaxPrice([50]);
                    setSortBy('rating');
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Driver List */}
          <main className="lg:col-span-3">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading drivers...</p>
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
            ) : filteredDrivers.length > 0 ? (
              <div className="space-y-4">
                {filteredDrivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No drivers found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMinRating([4.0]);
                      setMaxPrice([50]);
                      setSortBy('rating');
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
