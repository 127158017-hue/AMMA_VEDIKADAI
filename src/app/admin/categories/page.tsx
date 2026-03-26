/**
 * Admin Categories Management Page
 * Manage product categories - add, edit, delete
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CategoryService, Category } from '@/services/categories/categoryService';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
      setError('');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load categories';
      console.error('Load categories error:', errorMsg, err);
      
      // Check if it's a permission issue
      if (errorMsg.includes('permission-denied') || errorMsg.includes('permission') || errorMsg.includes('PERMISSION_DENIED')) {
        setError('❌ Permission Error: You need to configure Firestore security rules. Go to Firebase Console > Firestore Database > Rules and update them.');
      } else {
        setError(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await CategoryService.createCategory(newCategory.name, newCategory.description);
      setNewCategory({ name: '', description: '' });
      await loadCategories();
      // Show success for 2 seconds
      setError('✅ Category added successfully!');
      setTimeout(() => setError(''), 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add category';
      
      // Check if it's a permissions issue
      if (errorMsg.includes('permission-denied') || errorMsg.includes('permission')) {
        setError('❌ Permission denied. Make sure your Firestore rules are configured correctly. Check the console.');
      } else {
        setError(`❌ ${errorMsg}`);
      }
      console.error('Category creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editForm.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await CategoryService.updateCategory(id, {
        name: editForm.name,
        description: editForm.description,
      });
      setEditingId(null);
      await loadCategories();
      setError('✅ Category updated successfully!');
      setTimeout(() => setError(''), 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update category';
      if (errorMsg.includes('permission')) {
        setError('❌ Permission denied. Check Firestore rules.');
      } else {
        setError(`❌ ${errorMsg}`);
      }
      console.error('Category update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      setError('');
      await CategoryService.deleteCategory(id);
      await loadCategories();
      setError('✅ Category deleted successfully!');
      setTimeout(() => setError(''), 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete category';
      if (errorMsg.includes('permission')) {
        setError('❌ Permission denied. Check Firestore rules.');
      } else {
        setError(`❌ ${errorMsg}`);
      }
      console.error('Category delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, description: category.description || '' });
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to manage categories.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-sm mb-2">To become an admin:</p>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Go to Firebase Console</li>
              <li>Find your user in Firestore users collection</li>
              <li>Add field <code className="bg-gray-200 px-1">role: "admin"</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft size={20} />
          Back to Admin
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8">Manage Categories</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Add New Category Form */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Bombs, Chakkar, Pencils"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                <Plus size={20} /> Add Category
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Existing Categories ({categories.length})
            </h2>

            {categories.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-lg">
                No categories yet. Add one above!
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {editingId === category.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                          >
                            <Save size={16} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-2 bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 text-sm"
                          >
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEdit(category)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit category"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete category"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
