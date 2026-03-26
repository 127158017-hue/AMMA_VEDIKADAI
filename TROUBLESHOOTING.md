# EcoMerce Troubleshooting & FAQ

Quick solutions to common issues and frequently asked questions.

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Firebase Configuration](#firebase-configuration)
3. [Authentication Problems](#authentication-problems)
4. [Product Management](#product-management)
5. [Shopping & Checkout](#shopping--checkout)
6. [Admin Dashboard](#admin-dashboard)
7. [API & Performance](#api--performance)
8. [Deployment Issues](#deployment-issues)
9. [Database Problems](#database-problems)
10. [Image Upload Issues](#image-upload-issues)
11. [Payment Integration](#payment-integration)
12. [Excel Import](#excel-import)
13. [General Questions](#general-questions)

---

## Setup Issues

### Issue: npm install fails

**Symptoms:**
- `npm ERR!` messages during installation
- Module not found errors
- Dependency conflicts

**Solutions:**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules and lock file
rm -rf node_modules package-lock.json

# 3. Reinstall dependencies
npm install

# 4. If still failing, check Node version
node --version  # Should be 18+ or 20+

# 5. Update npm itself
npm install -g npm@latest
```

**Prevention:**
- Keep Node.js updated
- Don't manually edit `package-lock.json`
- Run `npm ci` instead of `npm install` in CI/CD

### Issue: Port 3000 already in use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# 1. Kill process on port 3000
# Windows (PowerShell as admin):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# 2. Or use different port
npm run dev -- -p 3001

# 3. Or restart computer
```

### Issue: env variables not loading

**Symptoms:**
- `Error: Firebase config is undefined`
- `.env` variables are undefined in code
- Different behavior locally vs deployed

**Solutions:**

```bash
# 1. Verify file exists and has content
cat .env.local

# 2. Check variable naming - MUST start with NEXT_PUBLIC_ for frontend
# ❌ Wrong (won't work on frontend)
API_URL=xxx

# ✅ Correct (works on frontend)
NEXT_PUBLIC_API_URL=xxx

# 3. Restart dev server after adding env vars
# Stop server (Ctrl+C) and run:
npm run dev

# 4. Check if .env.local is in .gitignore
cat .gitignore | grep env

# 5. For production, set env vars in deployment platform:
# Vercel: Dashboard → Settings → Environment Variables
# AWS: Elastic Beanstalk → Configuration → Software Settings
```

**Remember:**
- `.env.local` is for local development (git-ignored)
- `.env.example` is for documentation
- Production requires setting variables in deployment platform

---

## Firebase Configuration

### Issue: Firebase not initializing

**Symptoms:**
- `firebase.initializeApp is not a function`
- Firebase methods return undefined
- `Cannot read property 'auth' of undefined`

**Solutions:**

```typescript
// 1. Verify config exists at src/lib/firebase/config.ts
// Should have all 6 required fields:
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 2. Verify env variables are set
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY); // Should show key

// 3. Verify imports are correct
import { auth, db, storage } from '@/lib/firebase/config';

// 4. If using Firebase Admin SDK (server-side), ensure different setup:
import admin from 'firebase-admin';
// Uses FIREBASE_ADMIN_SDK_KEY environment variable
```

### Issue: Firestore rules blocking access

**Symptoms:**
- `Permission denied` errors in console
- Data not loading on frontend
- Admin operations fail

**Solutions:**

```
// 1. Check current rules in Firebase Console:
Firestore → Rules

// 2. For development (INSECURE - don't use in production!):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

// 3. For production with proper security:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow user to read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow anyone to read products, only admin to write
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Allow user to read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId || 
                            request.auth.token.admin == true;
    }
  }
}

// 4. Publish rules:
firebase deploy --only firestore:rules
```

### Issue: Authentication not working

**Symptoms:**
- Login always fails
- Users created but can't log in
- Firebase Auth methods throw errors

**Solutions:**

```typescript
// 1. Verify authentication methods enabled:
// Firebase Console → Authentication → Sign-in method
// Should have:
// ✓ Email/Password
// ✓ Google (optional)

// 2. Check if user exists:
async function debugUser(email: string) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    console.log('Login methods for this email:', methods);
  } catch (error) {
    console.error('User not found:', error);
  }
}

// 3. Verify Firestore user doc created:
// Should exist at: users/{uid}
// With fields: email, name, role, createdAt, updatedAt

// 4. Test signup flow:
try {
  const credential = await createUserWithEmailAndPassword(
    auth,
    "test@example.com",
    "Test1234!"
  );
  console.log('User created:', credential.user.uid);
} catch (error: any) {
  console.log('Signup error code:', error.code);
  // auth/email-already-in-use - email exists
  // auth/weak-password - password too weak
  // auth/invalid-email - email format wrong
}
```

---

## Authentication Problems

### Issue: Login redirect loop

**Symptoms:**
- Login page redirects to itself
- Can't stay logged in
- Session lost on page refresh

**Solutions:**

```typescript
// 1. Check if currentUser is being fetched:
// In useAuth hook, verify getCurrentUser is called on mount:

useEffect(() => {
  AuthService.getCurrentUser().then((user) => {
    if (user) {
      authStore.setUser(user);
    }
  });
}, []);

// 2. Check localStorage persistence:
// Open DevTools → Application → Local Storage
// Should see:
cart-store: {...}
auth-store: {"user":{...}}

// 3. Clear auth state and try again:
localStorage.removeItem('auth-store');
localStorage.removeItem('cart-store');
// Reload page and login again

// 4. Check token expiration:
// Firebase tokens expire after 1 hour
// Axios interceptor should handle refresh:
// In src/utils/axios-instance.ts
api.interceptors.request.use(async (config) => {
  const token = await AuthService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Issue: Google Sign-In not working

**Symptoms:**
- Google button does nothing
- "popup_closed_by_user" error
- Provider not configured error

**Solutions:**

```typescript
// 1. Verify Google OAuth configured:
// Firebase Console → Authentication → Sign-in method → Google
// Status should be ENABLED

// 2. Check OAuth consent screen configured:
// Google Cloud Console → APIs & Services → OAuth consent screen
// Should be set to External or Internal

// 3. Check authorized redirect URIs:
// Google Cloud Console → Credentials → OAuth 2.0 Client IDs
// Should include: https://localhost:3000, https://yourdomain.com

// 4. Check for popup blockers:
// Browser dev tools → Console
// No errors about popup blocked

// 5. Test in production domain:
// Google Sign-In must be on HTTPS (not HTTP)
// Cannot test on localhost in some browsers

// 6. Force Google popup open:
const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result.user);
  } catch (error: any) {
    console.error('Google sign-in error:', error.code, error.message);
    // auth/popup-closed-by-user - user closed popup
    // auth/popup-blocked - browser blocked popup
    // auth/unauthorized-domain - domain not authorized
  }
};
```

### Issue: Password reset not working

**Current State:**
- Password reset feature not implemented
- Users can't recover forgotten passwords

**To Add Password Reset:**

```typescript
// 1. Create password reset service:
// src/services/auth/passwordResetService.ts

export class PasswordResetService {
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  static async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error) {
      throw error;
    }
  }

  static async confirmPasswordReset(
    code: string,
    newPassword: string
  ): Promise<void> {
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      throw error;
    }
  }
}

// 2. Add to AuthService:
static async resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
```

---

## Product Management

### Issue: Products not loading

**Symptoms:**
- Products page shows empty
- Loading spinner never resolves
- Console shows fetch errors

**Solutions:**

```typescript
// 1. Check Firestore collection exists:
// Firebase Console → Firestore → Collections
// Should have "products" collection

// 2. Check if products exist:
console.log('Fetching products...');
try {
  const products = await ProductService.getAllProducts();
  console.log('Products:', products);
} catch (error: any) {
  console.error('Fetch error:', error.message);
}

// 3. Check Firestore query in ProductService:
const q = query(collection(db, 'products'));
const snapshot = await getDocs(q);
console.log('Total docs:', snapshot.size);

// 4. Verify data structure:
// Each product should have:
// - id, name, description, category, price, stock, imageUrl
// - createdAt, updatedAt timestamps

// 5. Test with hardcoded data:
// If API works with mock data, issue is with Firestore
const mockProducts = [
  { id: '1', name: 'Test', price: 100, stock: 5, ... }
];
// If this displays, Firestore is the issue
```

### Issue: Product creation fails

**Symptoms:**
- "Failed to create product" error
- Product created but not visible
- Image upload fails

**Solutions:**

```typescript
// 1. Check validation:
const { name, price, stock } = productData;
if (!name || price < 0 || stock < 0) {
  throw new Error('Invalid product data');
}

// 2. Check Firestore permissions:
// Firebase Console → Firestore → Rules
// Admin must have write permission to products collection

// 3. Test product creation step by step:
try {
  console.log('1. Validating data...');
  // Validation here
  
  console.log('2. Creating doc...');
  const ref = await addDoc(collection(db, 'products'), {
    name: 'Test Product',
    price: 99.99,
    stock: 10,
    category: 'Electronics',
    description: 'Test',
    imageUrl: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  console.log('3. Document created:', ref.id);
} catch (error: any) {
  console.error('Error:', error.message);
  // If step 2 fails, it's a permissions issue
  // If step 3 fails, it's a data issue
}

// 4. Check image upload separately:
const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const imageUrl = await ProductService.uploadProductImage(imageFile, 'product-id');
console.log('Image URL:', imageUrl);
```

### Issue: Product filtering not working

**Symptoms:**
- Category filter doesn't change products
- Price slider doesn't filter
- Search returns no results

**Solutions:**

```typescript
// 1. Check filters are being passed:
const [filters, setFilters] = useState({
  category: 'all',
  maxPrice: 100000,
  search: '',
});

console.log('Current filters:', filters); // Should update on change

// 2. Verify ProductService.getAllProducts handles filters:
static async getAllProducts(filters?: {
  category?: string;
  maxPrice?: number;
}): Promise<Product[]> {
  let q = query(collection(db, 'products'));
  
  if (filters?.category && filters.category !== 'all') {
    q = query(
      collection(db, 'products'),
      where('category', '==', filters.category)
    );
  }
  
  if (filters?.maxPrice) {
    q = query(
      collection(db, 'products'),
      where('price', '<=', filters.maxPrice)
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
}

// 3. Check search is client-side filtered:
const filtered = products.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase())
);

// 4. Ensure categories exist in products:
console.log('Available categories:', [...new Set(products.map(p => p.category))]);
```

---

## Shopping & Checkout

### Issue: Items not adding to cart

**Symptoms:**
- Add to Cart button doesn't work
- Cart stays empty
- Item count doesn't update

**Solutions:**

```typescript
// 1. Open DevTools → Application → Local Storage
// Look for 'cart-store' key
// Should contain items array

// 2. Test cart store directly:
import { useCartStore } from '@/stores/cartStore';

const { addItem, items, getTotal } = useCartStore();
console.log('Cart items before:', items);

addItem({
  productId: '123',
  name: 'Test Product',
  price: 99.99,
  quantity: 1,
});

console.log('Cart items after:', items);
console.log('Total:', getTotal());

// 3. Check button click handler:
const handleAddToCart = () => {
  console.log('Button clicked!'); // Verify click detected
  console.log('Product:', product); // Verify product loaded
  
  useCartStore.getState().addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
  });
  
  console.log('Attempted to add item');
};

// 4. Verify Zustand is properly initialized:
// Should see in Application tab: cart-store initialization
```

### Issue: Checkout form validation fails

**Symptoms:**
- "Please fill all required fields" always shows
- Form errors appear on empty form
- Cannot submit checkout

**Solutions:**

```typescript
// 1. Check form validation logic:
const errors: Record<string, string> = {};

if (!formData.street.trim()) {
  errors.street = 'Street address required';
}
if (!formData.city.trim()) {
  errors.city = 'City required';
}
if (!formData.state.trim()) {
  errors.state = 'State required';
}
if (!formData.zipCode.trim()) {
  errors.zipCode = 'ZIP code required';
}

// 2. Test validation function:
const isValid = Object.keys(errors).length === 0;
console.log('Form valid?', isValid);
console.log('Errors:', errors);

// 3. Check form inputs bound to state:
<input
  value={formData.street}
  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
/>
// If value not updating, onChange binding is wrong

// 4. Test form submission:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted');
  console.log('Form data:', formData);
  // Add more validation here if needed
};
```

### Issue: Order not created after checkout

**Symptoms:**
- Checkout form submits but no order created
- User stays on checkout page
- No error message shown

**Solutions:**

```typescript
// 1. Check order creation API call:
console.log('Creating order...');
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    products: cartItems,
    totalAmount: total,
    deliveryAddress: formData,
  }),
});

const data = await response.json();
console.log('Order response:', data);

if (!response.ok) {
  console.error('Order creation failed:', data.error);
}

// 2. Check order appears in Firestore:
// Firebase Console → Firestore → Collections → orders
// Should have new order document with current timestamp

// 3. Test OrderService directly:
const order = await OrderService.createOrder(
  userId,
  cartItems,
  total,
  deliveryAddress
);
console.log('Created order:', order);

// 4. Check error handling in checkout page:
try {
  // Order creation code
} catch (error: any) {
  console.error('Error creating order:', error);
  setError(error.message); // Should display error
}
```

---

## Admin Dashboard

### Issue: Admin dashboard not accessible

**Symptoms:**
- Non-admin users see dashboard
- Cannot access admin routes
- No permission check

**Solutions:**

```typescript
// 1. Verify role-based access in admin page:
// src/app/admin/page.tsx should have:

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && (!user || user.role !== 'admin')) {
      router.push('/'); // Redirect non-admin
    }
  }, [user, isReady, router]);

  if (!isReady) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  return <div>{/* Admin content */}</div>;
}

// 2. Verify user role in Firebase:
// Firebase Console → Firestore → users collection
// Each user doc should have:
// - role: "admin" or "customer"

// 3. Create admin user:
// Option A: Via Firebase Console
// 1. Go to Authentication → Users
// 2. Add user manually
// 3. Go to Firestore → users collection
// 4. Create document with uid as key
// 5. Set role field to "admin"

// Option B: Via code
const createAdminUser = async (email: string, password: string) => {
  const { user: authUser } = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  
  await setDoc(doc(db, 'users', authUser.uid), {
    id: authUser.uid,
    email,
    name: 'Admin User',
    role: 'admin', // This makes them admin
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// 4. Test admin role check:
const user = await AuthService.getCurrentUser();
console.log('User role:', user?.role);
console.log('Is admin?', user?.role === 'admin');
```

### Issue: Admin cannot edit/delete products

**Symptoms:**
- Edit/delete buttons disabled
- API returns permission denied
- Products cannot be updated

**Solutions:**

```typescript
// 1. Check product management page has edit/delete:
// src/app/admin/products/page.tsx

const handleDelete = async (productId: string) => {
  if (!confirm('Delete this product?')) return;
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Delete failed:', error);
      return;
    }
    
    // Refresh products list
    setProducts(products.filter(p => p.id !== productId));
  } catch (error: any) {
    console.error('Delete error:', error);
  }
};

// 2. Check API endpoint has admin auth:
// src/app/api/products/[id]/route.ts

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add admin authorization check
    // const user = await AuthService.getCurrentUser();
    // if (user?.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 403 }
    //   );
    // }

    const body = await req.json();
    const updated = await ProductService.updateProduct(params.id, body);
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 3. Enable admin authorization:
// Uncomment the TODO block above

// 4. Test with admin account:
const user = await AuthService.getCurrentUser();
console.log('Current user role:', user?.role);
```

---

## API & Performance

### Issue: API requests very slow

**Symptoms:**
- Products take 2+ seconds to load
- API responses timeout
- High latency on Firestore queries

**Solutions:**

```typescript
// 1. Measure API response time:
console.time('fetch-products');
const products = await ProductService.getAllProducts();
console.timeEnd('fetch-products'); // Shows actual time

// 2. Check for Firestore indexes:
// Rules often need composite indexes
// Firebase will show error with link to create index:
// Click link in error message to auto-create

// 3. Optimize queries with pagination:
const ITEMS_PER_PAGE = 20;

static async getAllProducts(page = 1): Promise<Product[]> {
  const startAt = (page - 1) * ITEMS_PER_PAGE;
  
  const q = query(
    collection(db, 'products'),
    limit(ITEMS_PER_PAGE),
    offset(startAt)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
}

// 4. Add caching with SWR:
import useSWR from 'swr';

export const useProducts = () => {
  const { data, error, isLoading } = useSWR(
    '/api/products',
    (url) => fetch(url).then(r => r.json()),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    products: data?.data || [],
    isLoading,
    error,
  };
};

// 5. Check network tab:
// DevTools → Network → observe request timing
// If slow on all requests, it's network/Firebase latency
// If only some requests slow, might be specific queries
```

### Issue: High bundle size

**Symptoms:**
- Page loads slowly
- Network shows large JS files
- First contentful paint slow

**Solutions:**

```bash
# 1. Analyze bundle:
npm run analyze

# 2. Identify large dependencies:
# DevTools → Network → filter by .js
# See which files are largest

# 3. Code split heavy components:
import dynamic from 'next/dynamic';

const ProductForm = dynamic(() => import('./ProductForm'), {
  loading: () => <div>Loading form...</div>,
});

// 4. Remove unused dependencies:
npm list | grep deduped

# 5. Optimize images:
# Use Next.js Image component with loading="lazy"
# Use WebP format instead of PNG/JPEG

# 6. Check for duplicate packages:
npm dedupe
npm install
```

### Issue: 401 Unauthorized errors on API calls

**Symptoms:**
- API calls fail with 401 status
- User logged in but requests fail
- Token not being sent

**Solutions:**

```typescript
// 1. Check axios interceptors:
// src/utils/axios-instance.ts should add token to requests:

api.interceptors.request.use(async (config) => {
  const token = await AuthService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Debug token:
console.log('Current token:', await AuthService.getAuthToken());

// 3. Check if user logged in:
const user = await AuthService.getCurrentUser();
console.log('Current user:', user);

// 4. Token expiration - refresh if needed:
// Firebase tokens expire after 1 hour
// Code should auto-refresh, but if not:

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, refresh it
      await auth.currentUser?.getIdToken(true);
      // Retry request
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

// 5. Check API route expects auth:
// If route requires auth but you're not sending token, get 401
// Verify which routes need authentication

// 6. Test with curl:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://localhost:3000/api/orders
```

---

## Deployment Issues

### Issue: Build fails on Vercel

**Symptoms:**
- Build fails with error
- Deployment stuck
- Vercel dashboard shows red X

**Solutions:**

```bash
# 1. Check build logs:
# Vercel Dashboard → Deployments → [Failed build] → Build logs
# Look for specific error

# 2. Build locally to test:
rm -rf .next
npm run build

# 3. Common build issues:
# - TypeScript errors: npx tsc --noEmit
# - ESLint errors: npx eslint .
# - Missing imports: Check all imports valid

# 4. Verify environment variables set:
# Vercel Dashboard → Settings → Environment Variables
# All NEXT_PUBLIC_* and server variables present

# 5. Check Node version:
# Vercel defaults to Node 18
# Can specify in vercel.json:
{
  "buildCommand": "npm run build",
  "env": {
    "NODEJS_VERSION": "20"
  }
}

# 6. Rebuild and redeploy:
# Vercel Dashboard → Deployments → [Failed] → Redeploy
```

### Issue: Environment variables not available on production

**Symptoms:**
- API not connecting
- Auth fails in production
- Error: Firebase config undefined

**Solutions:**

```bash
# 1. Verify vars set in Vercel:
# Vercel Dashboard → Settings → Environment Variables

# 2. Check variable names:
# Must exactly match what code expects:
NEXT_PUBLIC_FIREBASE_API_KEY=xxx  # Frontend
FIREBASE_ADMIN_SDK_KEY=xxx         # Backend

# 3. Redeploy after adding variables:
# Adding env vars requires rebuild:
# Vercel Dashboard → [Project] → Deployments → Redeploy

# 4. Don't commit .env.local:
cat .gitignore | grep env.local
# Should show: .env.local

# 5. Test in production:
# Visit https://yourdomain.com
# Open DevTools → Console
# Try to access env var:
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
```

---

## Database Problems

### Issue: Data not persisting

**Symptoms:**
- Data saves but disappears on refresh
- Firestore doesn't show new documents
- Changes reverted on page reload

**Solutions:**

```typescript
// 1. Check if data actually saved to Firestore:
// Firebase Console → Firestore → Collections
// Look for document just created

// 2. Check Firestore security rules:
// If rules deny writes, you won't see errors unless checking console

// 3. Enable error handling:
try {
  const ref = await addDoc(collection(db, 'products'), productData);
  console.log('Document saved:', ref.id);
} catch (error: any) {
  console.error('Save failed:', error.code, error.message);
  // permission-denied - rules blocking
  // not-found - collection doesn't exist
  // failed-precondition - document in wrong state
}

// 4. Check timestamps:
import { serverTimestamp } from 'firebase/firestore';

await setDoc(doc(db, 'products', 'id'), {
  ...data,
  createdAt: serverTimestamp(),  // Use server time
  updatedAt: serverTimestamp(),
});

// 5. Verify Firestore enabled:
// Firebase Console → Firestore Database
// Should be "Start in production mode" or "Start in test mode"
```

### Issue: Duplicate documents

**Symptoms:**
- Same product appears twice
- Orders creating multiple times
- Firestore has duplicate data

**Solutions:**

```typescript
// 1. Use explicit document IDs instead of auto-generated:
import { generateId } from '@/utils/generateId';

const docId = generateId();
await setDoc(doc(db, 'products', docId), {
  ...productData,
  id: docId, // Store ID in document too
});

// 2. Check for unhandled retry logic:
// Network errors shouldn't retry without user confirmation

// 3. Check form doesn't have multiple submit handlers:
<form onSubmit={handleSubmit}>
  {/* Only one onSubmit on form */}
  <button type="submit">Submit</button>
  {/* Not multiple onClick handlers on button */}
</form>

// 4. Prevent double-submit:
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return; // Prevent if already submitting
  
  try {
    setIsSubmitting(true);
    // Save data
  } finally {
    setIsSubmitting(false);
  }
};

// 5. Use transaction for atomic operations:
const transaction = db.transaction();

transaction.set(doc(db, 'products', id1), data1);
transaction.set(doc(db, 'products', id2), data2);

await transaction.commit(); // Both or neither
```

---

## Image Upload Issues

### Issue: Images not uploading

**Symptoms:**
- Upload button does nothing
- Progress bar stuck
- "Upload failed" error

**Solutions:**

```typescript
// 1. Check file size:
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const handleFileSelect = (file: File) => {
  if (file.size > MAX_SIZE) {
    console.error('File too large:', file.size);
    return;
  }
  console.log('File size OK:', file.size);
};

// 2. Check file type:
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (!ALLOWED_TYPES.includes(file.type)) {
  console.error('Invalid file type:', file.type);
  return;
}

// 3. Check Firebase Storage is configured:
// Firebase Console → Storage
// Should be "Started"

// 4. Check Storage rules allow upload:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to upload product images
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

// 5. Test upload with debug logging:
const handleUpload = async (file: File) => {
  try {
    console.log('1. Starting upload...');
    
    const ref = ref(storage, `products/${Date.now()}-${file.name}`);
    console.log('2. Created reference:', ref.fullPath);
    
    const uploadTask = uploadBytes(ref, file);
    console.log('3. Upload started');
    
    const snapshot = await uploadTask;
    console.log('4. Upload complete:', snapshot);
    
    const url = await getDownloadURL(ref);
    console.log('5. Got download URL:', url);
    
    return url;
  } catch (error: any) {
    console.error('Upload failed at step:', error.message);
  }
};

// 6. Check CORS for direct uploads:
// Usually not needed with Firebase SDK
```

### Issue: Image URL not working

**Symptoms:**
- Image shows broken icon
- 403 Forbidden errors
- URL expires and becomes invalid

**Solutions:**

```typescript
// 1. Check URL format:
// Should be: https://firebasestorage.googleapis.com/.../images%2Fproduct.jpg

// 2. Firebase Storage URLs don't expire by default:
// But if using custom tokens, they might
// Check expiration in URL parameters

// 3. Use getDownloadURL instead of manual URL construction:
const url = await getDownloadURL(ref);
// This gets fresh, valid URL

// 4. Check Storage rules allow read:
// In Firebase Console Security Rules
match /products/{allPaths=**} {
  allow read: if true;  // Must Allow reads!
}

// 5. Cache images locally if needed:
// Don't rely on URL lasting forever
// Download and store in IndexedDB or localStorage for offline use

// 6. Test image URL:
fetch(imageUrl).then(r => console.log('URL works:', r.ok));
// If returns 403, it's permissions or expiration
```

---

## Payment Integration

### Issue: Razorpay not working

**Symptoms:**
- "Create order failed" error
- Payment button doesn't appear
- URL not working properly

**Solutions:**

**Current Status:**
Razorpay integration is partially implemented (mock). To use real payments:

```bash
# 1. Get Razorpay credentials:
# - Sign up at https://razorpay.com
# - Go to Dashboard → Settings → API Keys
# - Copy Key ID and Secret

# 2. Add to .env.production:
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_SECRET=your_secret_here

# 3. Implement signature verification:
# In src/app/api/payments/verify/route.ts

import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = 
      await req.json();

    // Verify signature
    const hmac = crypto.createHmac(
      'sha256',
      process.env.RAZORPAY_SECRET!
    );
    
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const computed_signature = hmac.digest('hex');

    if (computed_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update order status
    await OrderService.updateOrderPaymentStatus(
      orderId,
      'success',
      razorpay_payment_id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

See DEPLOYMENT.md for full Razorpay setup guide.

---

## Excel Import

### Issue: Excel import not working

**Symptoms:**
- Upload button does nothing
- "Import failed" error
- File not being read

**Solutions:**

```typescript
// 1. Check file format:
// Must be .xlsx or .xls
// Supported by XLSX library

// 2. Check Excel structure:
// Required columns:
// - Product Name
// - Category
// - Price
// - Stock
// - Description (optional)

// 3. Debug import process:
const handleImport = async (file: File) => {
  try {
    console.log('1. File received:', file.name, file.size);
    
    const result = await ExcelImportService.processExcelImport(file);
    console.log('2. Process result:', result);
    
    console.log('Total processed:', result.processed);
    console.log('Successfully imported:', result.imported);
    console.log('Errors:', result.errors);
    
  } catch (error: any) {
    console.error('Import failed:', error.message);
  }
};

// 4. Check Excel parsing:
import XLSX from 'xlsx';

const parseExcel = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: 'array' });
    console.log('Sheets:', workbook.SheetNames);
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    console.log('Rows:', json);
  };
  reader.readAsArrayBuffer(file);
};

// 5. Test with sample file:
// Use template from /admin/import-excel page
// Should have header row with column names
```

### Issue: Products not importing despite no error

**Symptoms:**
- Import shows success
- No errors but products not appearing
- Firestore is empty

**Solutions:**

```typescript
// 1. Check products were created:
// Firebase Console → Firestore → products collection
// Should see new documents with imported data

// 2. Check error handling:
// Some errors might be silently caught
// Look at import results for individual row errors

// 3. Test with console logging:
const processExcelImport = async (file: File) => {
  const parsed = await parseExcelFile(file);
  console.log('Parsed rows:', parsed.length);
  
  const validated = validateAndTransformProducts(parsed);
  console.log('Valid products:', validated.products.length);
  console.log('Errors:', validated.errors);
  
  for (const product of validated.products) {
    const created = await ProductService.createProduct(product);
    console.log('Created product:', created.id);
  }
};

// 4. Verify data structure matches Product type:
// Each row needs: name, category, price, stock, description
// All required fields present?
console.log('Row data:', row);
// Should have all fields

// 5. Check permissions:
// User must be admin to import products
// Check user.role === 'admin' before import
```

---

## General Questions

### Q: How do I add a new feature?

**A:** Follow this process:

1. **Create folder structure:**
   ```
   src/components/feature/
   src/services/feature/
   src/hooks/useFeature.ts
   src/app/api/feature/route.ts
   src/app/feature/page.tsx
   ```

2. **Define types** in `src/types/index.ts`

3. **Create service** in `src/services/feature/featureService.ts`

4. **Create hook** in `src/hooks/useFeature.ts`

5. **Create components** in `src/components/feature/`

6. **Create API route** in `src/app/api/feature/route.ts`

7. **Create page** in `src/app/feature/page.tsx`

8. **Add to README**

See DEVELOPMENT.md for complete patterns.

### Q: How do I deploy to production?

**A:** See DEPLOYMENT.md for detailed instructions for:
- Vercel (recommended)
- Firebase Hosting
- Docker
- AWS EC2

### Q: How do I debug issues?

**A:** Use these tools:
- Browser DevTools (F12)
  - Console for errors
  - Network for API calls
  - Application for localStorage
  - React DevTools tab
- Firebase Console for database issues
- VS Code debugger for server-side code

### Q: Where do I store secrets?

**A:** 
- Local dev: `.env.local` (git-ignored)
- Production: Platform-specific (Vercel Dashboard, etc.)
- Never commit `.env.local` or secrets

### Q: How do I handle errors?

**A:** See DEVELOPMENT.md Error Handling section. Pattern:

```typescript
try {
  // Operation
} catch (error: any) {
  // Log
  console.error('Operation failed:', error);
  // Show user-friendly message
  setError('Operation failed. Please try again.');
}
```

### Q: Can I customize the UI?

**A:** Yes! All styles use Tailwind CSS. Edit:
- `src/styles/globals.css` - Global styles
- `src/components/**/*.tsx` - Component styles (className)
- Colors in `src/constants/index.ts` - Theme colors

### Q: How do I add more products?

**A:** Three options:
1. Admin dashboard → Add Product form
2. Admin dashboard → Import Excel (bulk)
3. Firebase Console → Create document manually

### Q: What if I forgot admin password?

**A:** 
1. Go to Firebase Console → Authentication
2. Click admin user → Delete
3. Create new admin user via Firebase Console
4. Create user document in Firestore with role: "admin"

### Q: Can I use different payment gateway?

**A:** Yes! Replace Razorpay with:
- Stripe
- Square
- PayPal
- Custom processor

See PaymentService in `src/services/payments/` for integration point.

### Q: How do I backup data?

**A:** 
1. Firebase Console → Firestore → Backups
2. Or use: `gcloud firestore export gs://bucket/path`
3. Set up automatic daily backups

### Q: Can I run this offline?

**A:** Partially. Use Firebase Emulator Suite:
```bash
firebase emulators:start
# Changes src code to connect to emulators
```

Offline support requires:
- Service workers
- IndexedDB for data caching
- Sync queue for offline changes

---

## Getting Help

If your issue isn't covered here:

1. **Check the docs:**
   - SETUP.md - Setup instructions
   - README.md - Overview
   - ARCHITECTURE.md - System design
   - DEVELOPMENT.md - Code patterns
   - DEPLOYMENT.md - Deployment

2. **Search GitHub Issues:**
   - Check if someone had same problem
   - Look for solutions in issues

3. **Check Stack Overflow:**
   - Search error message
   - Tag with: firebase, nextjs, react, typescript

4. **Firebase Support:**
   - Firebase Console → Support
   - Firebase Documentation: https://firebase.google.com/docs

5. **Next.js Support:**
   - Next.js Docs: https://nextjs.org/docs
   - GitHub Discussions: https://github.com/vercel/next.js/discussions

6. **Community:**
   - Vercel Community: https://vercel.com/support
   - React Discord: https://discord.gg/react
