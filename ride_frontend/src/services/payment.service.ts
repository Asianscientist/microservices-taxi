import api from './api';

export interface PaymentData {
  booking_id: number;
  payment_method: 'stripe' | 'wallet' | 'cash';
  stripe_payment_method_id?: string;
}

class PaymentService {
  /**
   * Create payment for booking
   */
  async createPayment(data: PaymentData) {
    const response = await api.post('/payments/create/', data);
    return response.data;
  }

  /**
   * Get user's payments
   */
  async getPayments() {
    const response = await api.get('/payments/');
    return response.data;
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: number) {
    const response = await api.get(`/payments/${paymentId}/`);
    return response.data;
  }

  /**
   * Get wallet details
   */
  async getWallet() {
    const response = await api.get('/payments/wallet/');
    return response.data;
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions() {
    const response = await api.get('/payments/wallet/transactions/');
    return response.data;
  }

  /**
   * Add funds to wallet
   */
  async addFunds(amount: number, description?: string) {
    const response = await api.post('/payments/wallet/add-funds/', {
      amount,
      description: description || 'Added funds to wallet',
    });
    return response.data;
  }

  /**
   * Get driver payouts (driver only)
   */
  async getPayouts() {
    const response = await api.get('/payments/payouts/');
    return response.data;
  }

  /**
   * Get refunds
   */
  async getRefunds() {
    const response = await api.get('/payments/refunds/');
    return response.data;
  }
}

export default new PaymentService();
