import api from './api';
import TripService from '../../services/trip.service';

export interface TripData {
  route_id: number;
  from_city: string;
  to_city: string;
  departure_datetime: string;
  estimated_arrival_datetime: string;
  price_per_seat: number;
  available_seats: number;
  notes?: string;
}

export interface BookingData {
  trip_id: number;
  number_of_seats: number;
  pickup_location?: string;
  pickup_notes?: string;
}

class TripService {
  /**
   * List available trips
   */
  async listTrips(params?: {
    from_city?: string;
    to_city?: string;
    search?: string;
    ordering?: string;
  }) {
    const response = await api.get('/trips/', { params });
    return response.data;
  }

  /**
   * Get trip details
   */
  async getTripDetails(tripId: number) {
    const response = await api.get(`/trips/${tripId}/`);
    return response.data;
  }

  /**
   * Create trip (driver only)
   */
  async createTrip(data: TripData) {
    const response = await api.post('/trips/create/', data);
    return response.data;
  }

  /**
   * Update trip (driver only)
   */
  async updateTrip(tripId: number, data: Partial<TripData>) {
    const response = await api.patch(`/trips/${tripId}/`, data);
    return response.data;
  }

  /**
   * Get driver's trips
   */
  async getDriverTrips() {
    const response = await api.get('/trips/driver/trips/');
    return response.data;
  }

  /**
   * Start trip (driver only)
   */
  async startTrip(tripId: number) {
    const response = await api.post(`/trips/${tripId}/start/`);
    return response.data;
  }

  /**
   * Complete trip (driver only)
   */
  async completeTrip(tripId: number) {
    const response = await api.post(`/trips/${tripId}/complete/`);
    return response.data;
  }

  /**
   * Create booking (passenger)
   */
  async createBooking(data: BookingData) {
    const response = await api.post('/trips/bookings/create/', data);
    return response.data;
  }

  /**
   * Get user's bookings
   */
  async getBookings() {
    const response = await api.get('/trips/bookings/');
    return response.data;
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: number) {
    const response = await api.get(`/trips/bookings/${bookingId}/`);
    return response.data;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: number, reason?: string) {
    const response = await api.post(`/trips/bookings/${bookingId}/cancel/`, {
      reason: reason || '',
    });
    return response.data;
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId: number) {
    const response = await api.post(`/trips/bookings/${bookingId}/confirm/`);
    return response.data;
  }

  /**
   * Get driver's bookings
   */
  async getDriverBookings() {
    const response = await api.get('/trips/driver/bookings/');
    return response.data;
  }

  /**
   * Mark passenger as no-show (driver only)
   */
  async markNoShow(bookingId: number) {
    const response = await api.post(`/trips/bookings/${bookingId}/no-show/`);
    return response.data;
  }

  /**
   * Get trip messages
   */
  async getTripMessages(tripId: number) {
    const response = await api.get(`/trips/${tripId}/messages/`);
    return response.data;
  }

  /**
   * Send trip message
   */
  async sendMessage(tripId: number, message: string) {
    const response = await api.post(`/trips/${tripId}/messages/`, {
      message,
    });
    return response.data;
  }

  /**
   * Get trip tracking data
   */
  async getTripTracking(tripId: number) {
    const response = await api.get(`/trips/${tripId}/tracking/`);
    return response.data;
  }

  /**
   * Add tracking point (driver only)
   */
  async addTrackingPoint(tripId: number, data: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  }) {
    const response = await api.post(`/trips/${tripId}/tracking/`, data);
    return response.data;
  }
}

export default new TripService();
