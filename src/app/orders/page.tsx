/**
 * User Orders Page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserOrders } from '@/hooks/useOrders';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/utils/formatters';
import { AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, error } = useUserOrders(user?.id || null);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          <AlertCircle size={20} />
          <span>Please log in to view your orders</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">No orders yet</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-semibold">{order.id.slice(0, 12)}...</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="font-semibold text-blue-600">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className={`font-semibold ${order.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus === 'success' ? 'Confirmed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
