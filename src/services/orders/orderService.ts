/**
 * Order Service
 * Handles order management with Firebase
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderProduct } from '@/types';
import { generateId } from '@/utils/generateId';

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(
    userId: string,
    products: OrderProduct[],
    totalAmount: number,
    deliveryAddress: Order['deliveryAddress']
  ): Promise<Order> {
    try {
      const orderId = generateId();
      const order: Order = {
        id: orderId,
        userId,
        products,
        totalAmount,
        paymentStatus: 'pending',
        deliveryAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'orders', orderId), order);
      return order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const snapshot = await getDoc(doc(db, 'orders', orderId));
      return snapshot.exists() ? (snapshot.data() as Order) : null;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  /**
   * Get all orders for a user
   */
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const snapshot = await getDocs(q as Query);
      return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user orders');
    }
  }

  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(): Promise<Order[]> {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      return snapshot.docs.map((doc) => doc.data() as Order);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  /**
   * Update order payment status
   */
  static async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: Order['paymentStatus'],
    paymentId?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus,
        ...(paymentId && { paymentId }),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order');
    }
  }
}
