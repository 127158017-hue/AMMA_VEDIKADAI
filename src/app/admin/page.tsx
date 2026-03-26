/**
 * Admin Dashboard
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { BarChart3, Package, Upload, ShoppingCart, Tag } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access denied. Admin access required.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Package, label: 'Products', value: '0', href: '/admin/products' },
    { icon: Tag, label: 'Categories', value: 'Manage', href: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', value: '0', href: '/admin/orders' },
    { icon: Upload, label: 'Import Excel', value: 'Upload', href: '/admin/import-excel' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your e-commerce platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <Link key={idx} href={stat.href}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <stat.icon size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/add-product"
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
            >
              <h3 className="font-semibold text-blue-600">Add New Product</h3>
              <p className="text-sm text-gray-600 mt-1">Create a single new product</p>
            </Link>
            <Link
              href="/admin/categories"
              className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
            >
              <h3 className="font-semibold text-purple-600">Manage Categories</h3>
              <p className="text-sm text-gray-600 mt-1">Add or remove product categories</p>
            </Link>
            <Link
              href="/admin/import-excel"
              className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition"
            >
              <h3 className="font-semibold text-green-600">Bulk Import</h3>
              <p className="text-sm text-gray-600 mt-1">Import products from Excel file</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
