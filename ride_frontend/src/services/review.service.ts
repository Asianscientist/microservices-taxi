import api from './api';

export interface ReviewData {
  booking: number;
  rating: number;
  punctuality_rating?: number;
  safety_rating?: number;
  vehicle_condition_rating?: number;
  communication_rating?: number;
  comment: string;
}

class ReviewService {
  /**
   * Create a review
   */
  async createReview(data: ReviewData) {
    const response = await api.post('/reviews/create/', data);
    return response.data;
  }

  /**
   * Get all reviews
   */
  async listReviews(params?: {
    reviewed_driver?: number;
    rating?: number;
    ordering?: string;
  }) {
    const response = await api.get('/reviews/', { params });
    return response.data;
  }

  /**
   * Get user's reviews
   */
  async getMyReviews() {
    const response = await api.get('/reviews/my-reviews/');
    return response.data;
  }

  /**
   * Get reviews received (driver only)
   */
  async getReceivedReviews() {
    const response = await api.get('/reviews/received/');
    return response.data;
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: number, data: Partial<ReviewData>) {
    const response = await api.patch(`/reviews/${reviewId}/`, data);
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number) {
    const response = await api.delete(`/reviews/${reviewId}/`);
    return response.data;
  }

  /**
   * Respond to a review (driver only)
   */
  async respondToReview(reviewId: number, responseText: string) {
    const response = await api.post('/reviews/responses/create/', {
      review: reviewId,
      response_text: responseText,
    });
    return response.data;
  }

  /**
   * Report a review
   */
  async reportReview(data: {
    review: number;
    reason: string;
    description: string;
  }) {
    const response = await api.post('/reviews/report/', data);
    return response.data;
  }
}

export default new ReviewService();
