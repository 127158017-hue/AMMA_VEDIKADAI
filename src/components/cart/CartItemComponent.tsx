/**
 * Cart Item Component
 */

'use client';

import Image from 'next/image';
import { CartItem } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { useCartStore } from '@/stores/cartStore';
import { X, Plus, Minus } from 'lucide-react';

interface CartItemComponentProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemComponentProps) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={item.imageUrl || '/images/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover rounded"
        />
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Total */}
      <div className="text-right">
        <p className="font-semibold text-gray-800">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.productId)}
        className="text-red-500 hover:text-red-700"
      >
        <X size={20} />
      </button>
    </div>
  );
}
