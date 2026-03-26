/**
 * Product Card Component
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { useCartStore } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image Container */}
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={product.imageUrl || '/images/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              loading="lazy"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
            <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>

            {/* Price and Button */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                <ShoppingCart size={18} />
              </button>
            </div>

            {/* Stock Info */}
            <p className="text-xs text-gray-500 mt-2">
              Stock: {product.stock}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
