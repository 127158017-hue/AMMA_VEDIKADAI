/**
 * Excel Import Page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/axios-instance';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function ImportExcelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const downloadTemplate = () => {
    // Create sample Excel data
    const sampleData = [
      {
        product_id: 'SKU001',
        name: 'Sample Product',
        category: 'Electronics',
        price: 999,
        description: 'This is a sample product description',
        image_url: 'https://example.com/image.jpg',
        stock: 50,
      },
    ];

    // Convert to CSV for simplicity (real implementation would use XLSX)
    const csv = [
      Object.keys(sampleData[0]).join(','),
      ...sampleData.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-template.csv';
    a.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setImportResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setImportResult(response.data.data);
      } else {
        setError(response.data.error);
        setImportResult(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import Excel file');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← Back to Admin
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Import Products from Excel</h1>
          <p className="text-gray-600 mb-8">Upload an Excel file to bulk import products into your catalog</p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {/* Download Template */}
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold mb-2">Step 1: Download Template</h2>
            <p className="text-sm text-gray-600 mb-4">
              Download the sample Excel template to understand the required format
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={20} />
              Download Template
            </button>
          </div>

          {/* Upload File */}
          <div className="mb-8">
            <h2 className="font-semibold mb-4">Step 2: Upload Your File</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">
                Drag and drop your Excel file or click to browse
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 font-medium"
              >
                {loading ? 'Uploading...' : 'Choose Excel File'}
              </label>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="font-semibold mb-4">Import Results</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total Processed:</span> {importResult.totalProcessed}</p>
                <p><span className="font-medium">Successfully Imported:</span> {importResult.imported}</p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-red-600 mb-2">Errors Found:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error: any, idx: number) => (
                        <div key={idx} className="text-sm bg-red-50 p-3 rounded border border-red-200">
                          <p className="font-medium">Row {error.row}:</p>
                          <ul className="list-disc list-inside ml-2">
                            {error.errors.map((e: string, i: number) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3">Required Excel Columns</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">product_id:</span> Unique product identifier (optional)</p>
              <p><span className="font-medium">name:</span> Product name (required)</p>
              <p><span className="font-medium">category:</span> Product category (required)</p>
              <p><span className="font-medium">price:</span> Product price in rupees (required)</p>
              <p><span className="font-medium">description:</span> Product description (optional)</p>
              <p><span className="font-medium">image_url:</span> URL to product image (optional)</p>
              <p><span className="font-medium">stock:</span> Available stock quantity (required)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
