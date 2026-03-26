/**
 * Cart Page
 */

'use client';

import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItemComponent from '@/components/cart/CartItemComponent';
import { formatPrice } from '@/utils/formatters';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add some products to get started!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <ArrowLeft size={20} />
        Back to Shopping
      </Link>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <CartItemComponent key={`${item.productId}-${index}`} item={item} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link href="/products" className="text-blue-600 hover:underline">
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatPrice(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatPrice(totalAmount * 0.18)}</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">
              {formatPrice(totalAmount * 1.18)}
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-3"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={clearCart}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
