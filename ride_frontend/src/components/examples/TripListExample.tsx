import { useState, useEffect } from 'react';
import tripService from '../../services/trip.service';

interface Trip {
  id: number;
  from_city: string;
  to_city: string;
  departure_datetime: string;
  price_per_seat: number;
  available_seats: number;
  driver_name: string;
  driver_rating: number;
  status: string;
}

export function TripListExample() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await tripService.listTrips(filters);
      setTrips(response.results || response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTrips({
      from_city: searchFrom,
      to_city: searchTo,
      ordering: 'departure_datetime',
    });
  };

  const handleBookTrip = async (tripId: number) => {
    try {
      const seats = prompt('How many seats do you need?');
      if (!seats) return;

      const response = await tripService.createBooking({
        trip_id: tripId,
        number_of_seats: parseInt(seats),
      });

      alert('Booking created! Please proceed to payment.');
      console.log('Booking:', response);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create booking');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading trips...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Available Trips</h2>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="From City"
            value={searchFrom}
            onChange={(e) => setSearchFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="To City"
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Trip List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trips found</p>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {trip.from_city} → {trip.to_city}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {new Date(trip.departure_datetime).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Driver: {trip.driver_name}</span>
                    <span>⭐ {trip.driver_rating?.toFixed(1) || 'N/A'}</span>
                    <span>{trip.available_seats} seats available</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ${trip.price_per_seat}
                    <span className="text-sm text-gray-500">/seat</span>
                  </p>
                  <button
                    onClick={() => handleBookTrip(trip.id)}
                    disabled={trip.available_seats === 0}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trip.available_seats > 0 ? 'Book Now' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
