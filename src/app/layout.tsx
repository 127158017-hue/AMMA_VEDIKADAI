/**
 * Root Layout
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/common/Header';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AMMA CRACKERS SHOP - Authentic Indian Crackers & Snacks',
  description: 'Premium quality Indian crackers, snacks, and savory treats',
  openGraph: {
    title: 'AMMA CRACKERS SHOP',
    description: 'Authentic Indian Crackers & Snacks',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'AMMA CRACKERS SHOP',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2026 AMMA CRACKERS SHOP. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
