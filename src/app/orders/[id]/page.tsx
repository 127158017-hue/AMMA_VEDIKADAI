/**
 * Order Confirmation Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/services/orders/orderService';
import { Order } from '@/types';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/utils/formatters';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default function OrderConfirmationPage({ params }: PageProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await OrderService.getOrderById(params.id);
        if (!orderData) {
          setError('Order not found');
          return;
        }
        setOrder(orderData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    }
  }, [params.id, user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view order details</p>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-3/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
          <AlertCircle size={20} />
          {error || 'Order not found'}
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-12">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully</h1>
        <p className="text-gray-600">
          Thank you for your order. We're preparing your items for shipment.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        {/* Order Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="font-semibold">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Payment Status</p>
            <p className={`font-semibold ${order.paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.paymentStatus === 'success' ? 'Paid' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.products.map(product => (
              <div key={product.productId} className="flex justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                </div>
                <p className="font-semibold">{formatPrice(product.price * product.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{order.deliveryAddress.street}</p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
            </p>
            <p className="text-sm text-gray-600">{order.deliveryAddress.country}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="flex justify-between text-xl font-bold">
          <span>Total Amount</span>
          <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Link
          href="/orders"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
