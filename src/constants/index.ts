/**
 * Application-wide constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    VERIFY_TOKEN: '/api/auth/verify',
  },
  PRODUCTS: {
    GET_ALL: '/api/products',
    GET_ONE: '/api/products/:id',
    CREATE: '/api/products',
    UPDATE: '/api/products/:id',
    DELETE: '/api/products/:id',
    IMPORT: '/api/products/import/excel',
  },
  ORDERS: {
    GET_ALL: '/api/orders',
    GET_ONE: '/api/orders/:id',
    CREATE: '/api/orders',
    UPDATE: '/api/orders/:id',
  },
  PAYMENTS: {
    CREATE_ORDER: '/api/payments/create-order',
    VERIFY_PAYMENT: '/api/payments/verify',
  },
};

// UI Constants
export const COLORS = {
  PRIMARY: '#2563EB',
  SECONDARY: '#111827',
  ACCENT: '#F59E0B',
  BACKGROUND: '#F9FAFB',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#FBBF24',
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Spicy Crackers',
  'Sweet Crackers',
  'Savory Mix',
  'Festival Special',
  'Organic & Healthy',
  'Dry Fruits Mix',
  'Regional Specialties',
  'Bulk Packs',
];

// Items per page for pagination
export const ITEMS_PER_PAGE = 12;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};
