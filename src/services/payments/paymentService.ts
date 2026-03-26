/**
 * Payment Service
 * Handles Razorpay payment integration
 */

import { apiClient } from '@/utils/axios-instance';
import { PaymentVerificationBody } from '@/types';

export class PaymentService {
  /**
   * Create a Razorpay order
   */
  static async createRazorpayOrder(
    amount: number,
    orderId: string
  ): Promise<{ id: string; amount: number; currency: string }> {
    try {
      const response = await apiClient.post('/api/payments/create-order', {
        amount,
        orderId,
      });

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to create Razorpay order'
      );
    }
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyPayment(
    paymentData: PaymentVerificationBody
  ): Promise<{ success: boolean; orderId: string; paymentId: string }> {
    try {
      const response = await apiClient.post(
        '/api/payments/verify',
        paymentData
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Payment verification failed'
      );
    }
  }
}
