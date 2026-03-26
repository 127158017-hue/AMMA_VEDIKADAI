/**
 * Product Detail Page
 */

'use client';

import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/utils/formatters';
import { ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useState, use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { product, loading, error } = useProduct(id);
  const { addItem } = useCartStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="h-12 bg-gray-200 rounded w-3/4" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <span>{error || 'Product not found'}</span>
        </div>
        <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-blue-600">
          <ArrowLeft size={20} />
          Back to Products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      quantity,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="flex items-center justify-center">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.imageUrl || '/images/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Price and Stock */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Price</p>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {formatPrice(product.price)}
            </p>
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                −
              </button>
              <span className="px-6 py-2 border-l border-r border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>

          {addedToCart && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
              Successfully added to cart!
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Quality Assured', desc: 'Premium products verified for quality' },
          { title: 'Fast Shipping', desc: 'Quick delivery to your doorstep' },
          { title: 'Easy Returns', desc: '30-day money-back guarantee' },
        ].map((info, idx) => (
          <div key={idx} className="p-4 bg-white rounded-lg shadow text-center">
            <h3 className="font-semibold mb-2">{info.title}</h3>
            <p className="text-gray-600 text-sm">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
