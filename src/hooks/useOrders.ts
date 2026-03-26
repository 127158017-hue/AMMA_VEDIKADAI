/**
 * useOrders hook - Fetching and managing orders
 */

'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { OrderService } from '@/services/orders/orderService';

export const useUserOrders = (userId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await OrderService.getUserOrders(userId);
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
};
