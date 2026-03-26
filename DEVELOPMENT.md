# EcoMerce Developer Guide

Best practices, patterns, and guidelines for developing EcoMerce.

## Table of Contents

1. [Code Standards](#code-standards)
2. [Folder Structure Guidelines](#folder-structure-guidelines)
3. [Working with Services](#working-with-services)
4. [Creating Components](#creating-components)
5. [API Route Development](#api-route-development)
6. [State Management](#state-management)
7. [Form Handling](#form-handling)
8. [Error Handling](#error-handling)
9. [TypeScript Guidelines](#typescript-guidelines)
10. [Testing Guidelines](#testing-guidelines)
11. [Performance Tips](#performance-tips)
12. [Security Best Practices](#security-best-practices)
13. [Common Patterns](#common-patterns)
14. [Debugging Tips](#debugging-tips)

---

## Code Standards

### Naming Conventions

#### Files and Folders

```
// Components (PascalCase)
src/components/auth/LoginForm.tsx
src/components/products/ProductCard.tsx

// Utils, hooks, services (camelCase)
src/hooks/useAuth.ts
src/utils/formatters.ts
src/services/auth/authService.ts

// API routes (lowercase, kebab-case)
src/app/api/auth/login/route.ts
src/app/api/products/[id]/route.ts

// Pages (lowercase, kebab-case for dynamic routes)
src/app/products/page.tsx
src/app/product/[id]/page.tsx
```

#### Variables and Functions

```typescript
// Constant (UPPER_SNAKE_CASE)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_TIMEOUT_MS = 10000;

// Variable (camelCase)
let userData: User;
const isLoading = false;

// Function (camelCase)
function formatPrice(price: number): string { }
const handleSubmit = () => { };

// Component (PascalCase)
function LoginForm() { }
const ProductCard = () => { };

// Hook (useXxx convention)
function useAuth() { }
const useProducts = () => { };

// Boolean prefix with 'is', 'has', 'can'
const isLoading = true;
const hasError = false;
const canSubmit = true;
```

### Code Formatting

- **Indentation**: 2 spaces
- **Line length**: 100 characters (soft limit 120)
- **Semicolons**: Required
- **Quotes**: Double quotes for strings

**ESLint Configuration** enforces these rules automatically.

### Import Organization

```typescript
// 1. External packages
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 2. Absolute imports from project
import { useAuth } from '@/hooks/useAuth';
import { ProductService } from '@/services/products/productService';
import { cn } from '@/lib/utils/cn';

// 3. Relative imports
import { Header } from '../common/Header';
import { PRODUCT_CATEGORIES } from '../../constants';

// 4. Styles
import styles from './LoginForm.module.css';
```

---

## Folder Structure Guidelines

### Adding New Features

**Directory structure for new feature (e.g., Reviews):**

```
src/
├── components/
│   └── reviews/
│       ├── ReviewCard.tsx
│       ├── ReviewForm.tsx
│       └── ReviewList.tsx
├── services/
│   └── reviews/
│       └── reviewService.ts
├── hooks/
│   └── useReviews.ts
├── app/
│   ├── api/
│   │   └── reviews/
│   │       ├── route.ts           # GET /api/reviews, POST /api/reviews
│   │       └── [id]/
│   │           └── route.ts       # GET/PUT/DELETE /api/reviews/:id
│   └── reviews/
│       └── page.tsx               # /reviews page
└── types/ (if new types added)
    └── review.ts
```

### Keep Features Modular

Each feature should be:
- Self-contained
- Independently testable
- Minimal cross-feature dependencies
- Easy to remove or replace

---

## Working with Services

### Service Class Pattern

```typescript
// src/services/reviews/reviewService.ts

export class ReviewService {
  // Fetch all reviews for a product
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Review));
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  // Create review
  static async createReview(reviewData: CreateReviewDto): Promise<Review> {
    try {
      // Validation
      if (!reviewData.rating || !reviewData.comment) {
        throw new Error('Rating and comment required');
      }

      // Business logic
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Review;
    } catch (error: any) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
}
```

### Service Best Practices

✅ **DO:**
- Use static methods for stateless operations
- Handle exceptions and provide meaningful errors
- Use TypeScript for type safety
- Validate inputs before processing
- Comment complex business logic
- Keep services focused on single domain

❌ **DON'T:**
- Mix UI logic with service logic
- Throw generic errors
- Ignore error cases
- Create service instances (`new ReviewService()`)
- Make services depend on React/UI libraries

---

## Creating Components

### Functional Component Pattern

```typescript
// src/components/reviews/ReviewCard.tsx

import React from 'react';
import { Review } from '@/types';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{review.userName}</p>
          <p className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
          </p>
        </div>
        
        {/* Rating */}
        <span className="text-lg font-bold text-yellow-500">
          ★ {review.rating}/5
        </span>
      </div>

      {/* Comment */}
      <p className="text-gray-700 mb-3">{review.comment}</p>

      {/* Actions */}
      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(review)}
            className={cn(
              'text-blue-600 hover:text-blue-800 text-sm',
              'px-3 py-1 rounded hover:bg-blue-50 transition-colors'
            )}
          >
            Edit
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className={cn(
              'text-red-600 hover:text-red-800 text-sm',
              'px-3 py-1 rounded hover:bg-red-50 transition-colors'
            )}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
```

### Component Best Practices

✅ **DO:**
- Use TypeScript interfaces for props
- Extract props into interface
- Use `React.FC` for type safety
- Memoize with `React.memo()` if needed
- Use composition over inheritance
- Make components reusable
- Accept callbacks as props
- Use semantic HTML

❌ **DON'T:**
- Prop drilling too deep (use context for 3+ levels)
- Complex logic in components
- Non-descriptive prop names
- Inline styles (use Tailwind)
- Components that do too much
- Forget TypeScript types

### Using Framer Motion

```tsx
import { motion } from 'framer-motion';

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="border rounded-lg p-4"
    >
      {/* Content */}
    </motion.div>
  );
};
```

---

## API Route Development

### Standard API Route Structure

```typescript
// src/app/api/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/services/reviews/reviewService';
import { ApiResponse } from '@/types';

// GET /api/reviews?productId=123
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Fetch data
    const reviews = await ReviewService.getProductReviews(productId);

    // Return response
    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('GET /api/reviews error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse request body
    const body = await req.json();

    // TODO: Add admin authorization check before POST
    // const user = await AuthService.getCurrentUser();
    // if (!user?.role === 'admin') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 403 }
    //   );
    // }

    // Validate input
    if (!body.productId || !body.comment || !body.rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create review
    const review = await ReviewService.createReview(body);

    // Return response
    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/reviews error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Handlers

```typescript
// src/app/api/reviews/[id]/route.ts

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reviews/123
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const review = await ReviewService.getReviewById(params.id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/123
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const updated = await ReviewService.updateReview(params.id, body);
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/123
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    await ReviewService.deleteReview(params.id);
    
    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Error Responses

```typescript
// Consistent error format
{
  success: false,
  error: "Descriptive error message"
}

// Status codes
200 - OK
201 - Created
400 - Bad Request (validation error)
401 - Unauthorized (not authenticated)
403 - Forbidden (not authorized)
404 - Not Found
409 - Conflict (duplicate, etc)
500 - Internal Server Error
```

---

## State Management

### Using Zustand Hooks

```typescript
// src/hooks/useReviews.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setReviews: (reviews: Review[]) => void;
  setError: (error: string | null) => void;
  addReview: (review: Review) => void;
  removeReview: (reviewId: string) => void;
}

const useReviewsStore = create<ReviewsState>()(
  devtools(
    (set) => ({
      reviews: [],
      isLoading: false,
      error: null,

      setReviews: (reviews) => set({ reviews }),
      setError: (error) => set({ error }),
      addReview: (review) =>
        set((state) => ({
          reviews: [review, ...state.reviews],
        })),
      removeReview: (reviewId) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== reviewId),
        })),
    })
  )
);

// Usage in component
export const ReviewList = () => {
  const { reviews, isLoading } = useReviewsStore();
  
  return <div>{/* Render reviews */}</div>;
};
```

### Component Hooks vs Store Hooks

**Use component hooks** for:
- Single component state
- Form input state
- UI-only state

**Use store hooks** for:
- Shared data (cart, auth)
- Persistent state
- Global application state

---

## Form Handling

### Basic Form Pattern

```typescript
// src/components/reviews/ReviewForm.tsx

import { useState } from 'react';
import { ReviewService } from '@/services/reviews/reviewService';

interface ReviewFormProps {
  productId: string;
  onSuccess: (review: Review) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    }
    if (formData.comment.length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsLoading(true);
      setErrors({});

      const review = await ReviewService.createReview({
        productId,
        ...formData,
      });

      onSuccess(review);
      
      // Reset form
      setFormData({ rating: 5, comment: '' });
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <select
          value={formData.rating}
          onChange={(e) =>
            setFormData({ ...formData, rating: parseInt(e.target.value) })
          }
          className="w-full border rounded px-3 py-2"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} - {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n - 1]}
            </option>
          ))}
        </select>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">Comment</label>
        <textarea
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
          placeholder="Share your experience..."
          rows={5}
          className={cn(
            'w-full border rounded px-3 py-2',
            errors.comment && 'border-red-500'
          )}
        />
        {errors.comment && (
          <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
        )}
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};
```

---

## Error Handling

### Service Error Handling

```typescript
try {
  // Operation that might fail
  const result = await someAsyncOperation();
  return result;
} catch (error: any) {
  // Log error for debugging
  console.error('Operation failed:', error);

  // Provide user-friendly message
  if (error.code === 'permission-denied') {
    throw new Error('You do not have permission to perform this action');
  }

  if (error.message.includes('network')) {
    throw new Error('Network error - please check your connection');
  }

  // Generic fallback
  throw new Error('Operation failed. Please try again.');
}
```

### Component Error Boundary

```typescript
// src/app/reviews/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function ReviewsPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set the error in try-catch block
    try {
      // Component logic
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return <div>{/* Page content */}</div>;
}
```

---

## TypeScript Guidelines

### Strong Typing

```typescript
// ✅ Good - explicit types
function processReview(review: Review, userId: string): Promise<Review> {
  // Implementation
}

// ❌ Bad - implicit any types
function processReview(review, userId) {
  // Implementation
}
```

### Interface Over Type for Objects

```typescript
// ✅ Good - interface for object types
interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ❌ Avoid - for object types use interface
type Review = {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};
```

### Generics for Reusable Functions

```typescript
// ✅ Good - generic function
function processResponse<T>(response: Response): Promise<T> {
  return response.json();
}

// Usage
const reviews = await processResponse<Review[]>(response);
```

### Avoid Any

```typescript
// ❌ Bad - using any
function handleData(data: any) {
  return data.something;
}

// ✅ Good - specific type
function handleData(data: ReviewData) {
  return data.rating;
}

// ✅ Good - unknown when type truly unknown
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard
  }
}
```

---

## Testing Guidelines

### Unit Test Example

```typescript
// src/services/reviews/reviewService.test.ts

import { ReviewService } from './reviewService';
import { Review } from '@/types';

describe('ReviewService', () => {
  describe('createReview', () => {
    it('should create a review with valid data', async () => {
      // Arrange
      const reviewData = {
        productId: '123',
        rating: 5,
        comment: 'Great product!',
        userName: 'John',
      };

      // Act
      const result = await ReviewService.createReview(reviewData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.rating).toBe(5);
    });

    it('should throw error with invalid rating', async () => {
      // Arrange
      const reviewData = {
        productId: '123',
        rating: 10, // Invalid
        comment: 'Great product!',
        userName: 'John',
      };

      // Act & Assert
      await expect(ReviewService.createReview(reviewData)).rejects.toThrow();
    });
  });
});
```

### Component Test Example

```typescript
// src/components/reviews/ReviewCard.test.tsx

import { render, screen } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';

describe('ReviewCard', () => {
  it('should render review data', () => {
    // Arrange
    const review = {
      id: '1',
      rating: 5,
      comment: 'Great product',
      userName: 'John',
      createdAt: new Date(),
    };

    // Act
    render(<ReviewCard review={review} />);

    // Assert
    expect(screen.getByText('Great product')).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });
});
```

---

## Performance Tips

### Memoization

```typescript
// Memoize expensive computations
import { useMemo } from 'react';

export const ReviewList = ({ reviews }: Props) => {
  const averageRating = useMemo(
    () => reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    [reviews]
  );

  return <div>{averageRating.toFixed(1)}</div>;
};
```

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const ReviewForm = dynamic(() => import('./ReviewForm'), {
  loading: () => <div>Loading form...</div>,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={review.userAvatar}
  alt={review.userName}
  width={40}
  height={40}
  priority={false}
  loading="lazy"
/>
```

---

## Security Best Practices

### Validate Input Server-Side

```typescript
// Always validate on server, don't trust client
if (!isValidEmail(email)) {
  throw new Error('Invalid email');
}
```

### Sanitize Output

```typescript
// Prevent XSS attacks
for (const review of reviews) {
  // Escape HTML in comment
  review.comment = review.comment.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

### Environment Variables

```typescript
// ✅ OK on frontend
NEXT_PUBLIC_API_URL=https://api.example.com

// ❌ Never on frontend
API_SECRET=supersecret
RAZORPAY_SECRET=xxx
```

### Authentication Checks

```typescript
// Protected API route
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Get user from token
    const user = await AuthService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check authorization
    const review = await ReviewService.getReviewById(params.id);
    if (review.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Proceed with deletion
    await ReviewService.deleteReview(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Common Patterns

### Fetch Data Pattern

```typescript
const [data, setData] = useState<Review[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ReviewService.getProductReviews(productId);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [productId]);
```

### Conditional Rendering

```typescript
// Loading state
if (isLoading) return <div>Loading...</div>;

// Error state
if (error) return <div className="text-red-600">Error: {error}</div>;

// Empty state
if (data.length === 0) return <div>No reviews yet</div>;

// Success state
return <div>{/* Render data */}</div>;
```

### Debounced Search

```typescript
import { debounce } from 'lodash';

const [search, setSearch] = useState('');

const handleSearch = useMemo(
  () =>
    debounce((query: string) => {
      // Perform search
    }, 300),
  []
);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch(e.target.value);
  handleSearch(e.target.value);
};
```

---

## Debugging Tips

### React DevTools

1. Install [React DevTools Extension](https://react-devtools-extension.com/)
2. Open DevTools (F12)
3. Go to React tab
4. Inspect components, check props, state

### Firebase DevTools

```typescript
// Enable Firebase debugging
import { enableLogging } from 'firebase/database';
enableLogging(true);
```

### Next.js Debugging

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Or use Node debugger
node --inspect-brk ./node_modules/.bin/next dev
```

### Console Logging

```typescript
// Useful logging patterns
console.log('value:', value);      // Variable value
console.table(array);               // Table format
console.trace('here');              // Stack trace
console.time('label');              // Performance timer
console.timeEnd('label');
```

### NextJS API Route Debugging

```typescript
export async function GET(req: NextRequest) {
  console.log('Query params:', req.nextUrl.searchParams);
  console.log('Headers:', Object.fromEntries(req.headers));
  console.log('Body:', await req.json().catch(() => null));

  // ... rest of handler
}
```

---

## Quick Reference

### Important Directories

| Directory | Purpose |
|-----------|---------|
| `/src/app` | Pages and layouts (Next.js App Router) |
| `/src/components` | React components |
| `/src/services` | Business logic services |
| `/src/hooks` | Custom React hooks |
| `/src/types` | TypeScript type definitions |
| `/src/utils` | Utility functions |
| `/src/constants` | Application constants |
| `/src/stores` | Zustand state management |
| `/src/lib` | Library configurations |

### Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
npm run analyze      # Analyze bundle size
```

---

For more information, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
