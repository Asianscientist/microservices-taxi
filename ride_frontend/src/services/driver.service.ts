import api from './api';

export interface DriverProfileData {
  license_number: string;
  license_image_front: File;
  license_image_back: File;
  license_expiry_date: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  license_plate: string;
  vehicle_image?: File;
  total_seats: number;
  insurance_number: string;
  insurance_image: File;
  insurance_expiry_date: string;
  years_of_experience: number;
  bio?: string;
}

class DriverService {
  /**
   * Create driver profile
   */
  async createProfile(data: DriverProfileData) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await api.post('/drivers/profile/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get driver profile
   */
  async getProfile() {
    const response = await api.get('/drivers/profile/');
    return response.data;
  }

  /**
   * Update driver profile
   */
  async updateProfile(data: Partial<DriverProfileData>) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await api.patch('/drivers/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get driver statistics
   */
  async getStats() {
    const response = await api.get('/drivers/profile/stats/');
    return response.data;
  }

  /**
   * Toggle driver availability
   */
  async toggleAvailability() {
    const response = await api.post('/drivers/profile/toggle-availability/');
    return response.data;
  }

  /**
   * List all drivers (public)
   */
  async listDrivers(params?: {
    is_available?: boolean;
    vehicle_make?: string;
    search?: string;
    ordering?: string;
  }) {
    const response = await api.get('/drivers/', { params });
    return response.data;
  }

  /**
   * Get driver details (public)
   */
  async getDriverDetails(driverId: number) {
    const response = await api.get(`/drivers/${driverId}/`);
    return response.data;
  }

  /**
   * Get driver by ID (alias for getDriverDetails)
   */
  async getDriverById(driverId: number) {
    return this.getDriverDetails(driverId);
  }

  /**
   * Get driver reviews
   */
  async getDriverReviews(driverId: number) {
    const response = await api.get(`/reviews/driver/${driverId}/`);
    return response.data;
  }

  /**
   * Get driver rating stats
   */
  async getDriverRatingStats(driverId: number) {
    const response = await api.get(`/reviews/driver/${driverId}/stats/`);
    return response.data;
  }

  /**
   * Get available routes
   */
  async getRoutes(params?: { search?: string }) {
    const response = await api.get('/drivers/routes/', { params });
    return response.data;
  }

  /**
   * Add driver availability schedule
   */
  async addAvailability(data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) {
    const response = await api.post('/drivers/availability/', data);
    return response.data;
  }

  /**
   * Get pending driver verifications (admin only)
   */
  async getPendingVerifications() {
    const response = await api.get('/drivers/pending-verifications/');
    return response.data;
  }

  /**
   * Verify driver license (admin only)
   */
  async verifyDriver(driverId: number, data: {
    license_verification_status: 'approved' | 'rejected';
    license_verification_notes?: string;
  }) {
    const response = await api.post(`/drivers/${driverId}/verify/`, data);
    return response.data;
  }
}

export default new DriverService();
