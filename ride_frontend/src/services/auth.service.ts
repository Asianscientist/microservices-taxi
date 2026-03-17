import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: 'passenger' | 'driver';
  phone_number?: string;
  date_of_birth?: string;
  city?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
    phone_verified: boolean;
    profile_picture?: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/accounts/register/', data);
    this.setTokens(response.data.tokens);
    this.setUser(response.data.user);
    return response.data;
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/accounts/login/', data);
    this.setTokens(response.data.tokens);
    this.setUser(response.data.user);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/accounts/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get('/accounts/profile/');
    this.setUser(response.data);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<RegisterData>) {
    const response = await api.patch('/accounts/profile/', data);
    this.setUser(response.data);
    return response.data;
  }

  /**
   * Send OTP for phone verification
   */
  async sendOTP(phoneNumber: string) {
    const response = await api.post('/accounts/send-otp/', {
      phone_number: phoneNumber,
    });
    return response.data;
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otpCode: string) {
    const response = await api.post('/accounts/verify-otp/', {
      phone_number: phoneNumber,
      otp_code: otpCode,
    });
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string, newPassword2: string) {
    const response = await api.post('/accounts/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(tokens: { access: string; refresh: string }) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  /**
   * Store user in localStorage
   */
  private setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear all auth data
   */
  private clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();
