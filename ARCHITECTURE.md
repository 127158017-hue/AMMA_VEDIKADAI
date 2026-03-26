# EcoMerce Architecture Documentation

## System Overview

EcoMerce is a full-stack e-commerce platform built with a modular, scalable architecture. The system separates concerns into clear layers:

```
┌─────────────────────────────────────────────────┐
│        Client Layer (Browser)                   │
│   React Components + Next.js Pages              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│     Presentation Layer                          │
│   Pages, Components, UI Logic                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│     API Layer (Next.js Routes)                  │
│   Request Handling & Validation                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│     Business Logic Layer (Services)             │
│   Auth, Products, Orders, Payments              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│     Data Access Layer                           │
│   Firebase Client SDK                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│     Backend Services (Firebase)                 │
│   Firestore, Authentication, Storage            │
└─────────────────────────────────────────────────┘
```

## Architectural Layers

### 1. Presentation Layer

**Location**: `/src/components` and `/src/app`

Components and Pages that users interact with directly.

**Key Responsibilities:**
- Render UI
- Handle user interactions
- Display data
- Form validation (client-side)

**Examples:**
- `Header.tsx` - Navigation component
- `LoginForm.tsx` - Authentication form
- `ProductCard.tsx` - Product display
- `CartItemComponent.tsx` - Cart items

**Design Principles:**
- Component-driven (reusable, composable)
- Single Responsibility
- PropTypes/TypeScript for type safety
- Accessible markup

### 2. State Management Layer

**Location**: `/src/stores`

Global state management using Zustand.

**Key Stores:**
- `cartStore.ts` - Shopping cart state
- `authStore.ts` - Authentication state

**Implementation Details:**
```typescript
// Zustand pattern with persistence
const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      totalAmount: 0,
      
      // Methods
      addItem: (item) => { /* ... */ },
      removeItem: (productId) => { /* ... */ },
    }),
    { name: 'cart-store' } // Persist to localStorage
  )
);
```

**Benefits:**
- Lightweight (no Redux boilerplate)
- TypeScript support
- Persistent state
- React hooks API

### 3. Custom Hooks Layer

**Location**: `/src/hooks`

Reusable logic encapsulated in custom hooks.

**Available Hooks:**
- `useAuth()` - Authentication and user management
- `useProducts()` - Product fetching with filters
- `useOrders()` - Order management

**Usage Example:**
```tsx
const { user, login, logout } = useAuth();
const { products, loading } = useProducts({ category: 'Electronics' });
```

**Benefits:**
- Logic reusability
- Clean component code
- Separation of concerns
- Easy testing

### 4. Services Layer

**Location**: `/src/services`

Business logic for domain operations.

**Service Classes:**

#### AuthService (`services/auth/authService.ts`)
```typescript
- signup(email, password, name)
- login(email, password)
- logout()
- loginWithGoogle()
- getCurrentUser()
- getAuthToken()
```

#### ProductService (`services/products/productService.ts`)
```typescript
- getAllProducts(filters)
- getProductById(id)
- createProduct(data)
- updateProduct(id, updates)
- deleteProduct(id)
- uploadProductImage(file, productId)
- importProductsFromExcel(products)
- searchProducts(term)
```

#### OrderService (`services/orders/orderService.ts`)
```typescript
- createOrder(userId, products, total, address)
- getOrderById(id)
- getUserOrders(userId)
- getAllOrders()
- updateOrderPaymentStatus(id, status, paymentId)
```

#### PaymentService (`services/payments/paymentService.ts`)
```typescript
- createRazorpayOrder(amount, orderId)
- verifyPayment(data)
```

#### ExcelImportService (`services/products/excelImportService.ts`)
```typescript
- parseExcelFile(file)
- validateAndTransformProducts(data)
- processExcelImport(file)
```

**Design Pattern:**
- Static class methods
- Error handling and validation
- Abstraction over Firebase SDK
- Testable and reusable

### 5. API Layer

**Location**: `/src/app/api`

Next.js API routes for client-server communication.

**Route Structure:**
- `/api/auth/` - Authentication endpoints
- `/api/products/` - Product endpoints
- `/api/orders/` - Order endpoints
- `/api/payments/` - Payment endpoints

**Responsibilities:**
- Request validation
- Business logic orchestration
- Response formatting
- Error handling

**Example Route:**
```typescript
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password } = await req.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing fields' },
        { status: 400 }
      );
    }
    
    // Call service
    const user = await AuthService.login(email, password);
    
    // Return response
    return NextResponse.json(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 6. Data Access Layer

**Location**: `/src/lib/firebase`

Firebase SDK configuration and initialization.

**Files:**
- `config.ts` - Client SDK configuration
- `admin.ts` - Admin SDK (optional)

**Exported Instances:**
```typescript
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 7. Utility & Helper Layer

**Location**: `/src/utils` and `/src/lib/utils`

Reusable helper functions.

**Utilities:**
- `formatters.ts` - Price, date formatting
- `validation.ts` - Input validation
- `cn.ts` - Tailwind class merging
- `generateId.ts` - ID generation
- `axios-instance.ts` - HTTP client with interceptors

## Data Flow

### User Registration & Approval Flow

```
SignupForm
    ↓
useAuth.signup()
    ↓
POST /api/auth/signup
    ↓
AuthService.signup()
    ↓
Firebase createUserWithEmailAndPassword()
    ↓
Firestore setDoc(users/{uid}, userData)
    ↓
Response → localStorage → useAuthStore
    ↓
Redirect to /
```

### Product Browsing Flow

```
ProductsPage Component
    ↓
useProducts(filters) → Custom Hook
    ↓
ProductService.getAllProducts()
    ↓
Firestore getDocs(query)
    ↓
Cache in useState
    ↓
Render ProductCard Components
```

### Order Creation Flow

```
CheckoutPage
    ↓
handleSubmit() Form Handler
    ↓
OrderService.createOrder()
    ↓
Firestore setDoc(orders/{id}, orderData)
    ↓
PaymentService.createRazorpayOrder()
    ↓
POST /api/payments/create-order
    ↓
Razorpay API (mocked for now)
    ↓
Open Payment Modal
    ↓
PaymentService.verifyPayment()
    ↓
Update Order Status in Firestore
    ↓
Redirect to /orders/{id}
```

## Database Schema

### Collections Structure

```
Firestore Root
├── users/
│   ├── {uid}/
│   │   ├── id: string
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── role: 'admin' | 'customer'
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
├── products/
│   ├── {productId}/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── description: string
│   │   ├── category: string
│   │   ├── price: number
│   │   ├── stock: number
│   │   ├── imageUrl: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│
└── orders/
    ├── {orderId}/
    │   ├── id: string
    │   ├── userId: string
    │   ├── products: OrderProduct[]
    │   ├── totalAmount: number
    │   ├── paymentStatus: string
    │   ├── paymentId: string (optional)
    │   ├── deliveryAddress: object
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp
```

## File Organization

### Component Organization

```
components/
├── auth/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── products/
│   ├── ProductCard.tsx
│   └── Skeleton.tsx
├── cart/
│   └── CartItemComponent.tsx
├── admin/
│   └── (admin components)
└── common/
    └── Header.tsx
```

**Naming Convention:**
- PascalCase for components: `LoginForm.tsx`
- Descriptive names indicating purpose
- Related components in subdirectories

### Page Organization

```
app/
├── page.tsx              # Home page (/)
├── layout.tsx            # Root layout
├── auth/
│   ├── login/page.tsx    # /auth/login
│   └── signup/page.tsx   # /auth/signup
├── products/
│   └── page.tsx          # /products
├── product/
│   └── [id]/page.tsx     # /product/:id
├── cart/
│   └── page.tsx          # /cart
├── checkout/
│   └── page.tsx          # /checkout
├── orders/
│   ├── page.tsx          # /orders
│   └── [id]/page.tsx     # /orders/:id
├── admin/
│   ├── page.tsx          # /admin
│   ├── products/
│   │   ├── page.tsx      # /admin/products
│   │   └── [id]/...      # /admin/products/:id
│   ├── add-product/
│   │   └── page.tsx      # /admin/add-product
│   ├── import-excel/
│   │   └── page.tsx      # /admin/import-excel
│   └── orders/
│       └── page.tsx      # /admin/orders
└── api/                  # API routes
    ├── auth/...
    ├── products/...
    ├── orders/...
    └── payments/...
```

## Type System

All major entities are strongly typed with TypeScript interfaces:

```typescript
// Core Types
User
Product
Cart
CartItem
Order
OrderProduct
PaymentVerificationBody
ApiResponse<T>
ExcelProduct
AuthContextType
```

**Benefits:**
- IntelliSense support
- Compile-time error checking
- Better code documentation
- Easier refactoring

## Security Architecture

### Authentication Flow

```
Firebase Auth
    ↓
ID Token (JWT)
    ↓
Secure httpOnly Cookie OR localStorage
    ↓
API Request Interceptor adds token
    ↓
Backend validates token
    ↓
User context available in route
```

### Authorization Strategy

**Role-Based Access Control (RBAC):**
```typescript
if (user?.role === 'admin') {
  // Show admin features
}

// In API routes
const user = await AuthService.getCurrentUser();
if (user?.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### Data Protection

- Firebase Security Rules for Firestore
- Firebase Security Rules for Storage
- Environment variables for secrets
- HTTPS for all external communication

## Scalability Considerations

### Current Architecture Supports:

1. **Caching**
   - Next.js automatic caching
   - localStorage for session data
   - Zustand stores with persistence

2. **Database Indexing**
   - Firestore composite indexes for queries
   - Query optimization in services

3. **Image Optimization**
   - Firebase Storage CDN
   - Next.js Image component (future enhancement)

4. **API Optimization**
   - Axios request/response interceptors
   - Pagination ready (ITEMS_PER_PAGE constant)

### Future Scaling Options:

1. **Database**
   - Migrate to Cloud Datastore (Firestore alternative)
   - Implement caching layer (Redis)

2. **API**
   - Separate backend service
   - GraphQL instead of REST
   - Rate limiting and throttling

3. **Frontend**
   - Code splitting automatic with Next.js
   - Service workers for offline support
   - PWA capabilities

4. **Payments**
   - Production Razorpay integration
   - Stripe/PayPal support
   - Multiple currency support

## Deployment Architecture

### Local Development
```
npm run dev
    ↓
Next.js Dev Server (localhost:3000)
    ↓
Firebase Emulator Suite (optional)
```

### Production Deployment

**Option 1: Vercel (Recommended)**
```
GitHub Push
    ↓
Vercel Auto-Deploy
    ↓
Build & Optimize
    ↓
Edge Network Distribution
    ↓
Firebase Backend (Global)
```

**Option 2: Self-Hosted**
```
Docker Build
    ↓
Docker Registry Push
    ↓
Server Pull & Run
    ↓
Reverse Proxy (Nginx)
    ↓
Firebase Backend
```

## Performance Metrics

### Target Performance:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **API Response**: < 200ms
- **Firestore Latency**: < 100ms

### Optimization Techniques:
- Code splitting automatic with Next.js
- Image lazy loading with Intersection Observer
- Bundle size optimization with tree-shaking
- Service worker caching (future)

## Error Handling Strategy

### Client-Side
```typescript
try {
  // API call
} catch (error: any) {
  // Show user-friendly message
  setError(error.message);
}
```

### API Routes
```typescript
try {
  // Service call
} catch (error: any) {
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### Production (Future)
- Integrate Sentry for error tracking
- Error logging to service
- User notification system
- Graceful degradation

## Testing Strategy

### Unit Tests (Future Implementation)
```typescript
// services/auth/authService.test.ts
describe('AuthService', () => {
  it('should login user with correct credentials', async () => {
    // Test setup
    // Call method
    // Assert results
  });
});
```

### Integration Tests (Future)
```typescript
// api/auth/login.test.ts
describe('POST /api/auth/login', () => {
  it('should return user on successful login', async () => {
    // Setup request
    // Send POST
    // Verify response
  });
});
```

### E2E Tests (Future)
```typescript
// Using Cypress or Playwright
describe('User Registration Flow', () => {
  it('should register new user', () => {
    cy.visit('/auth/signup');
    cy.fill_form();
    cy.submit();
    cy.should_redirect_to('/');
  });
});
```

## Documentation & Code Quality

### Code Standards:
- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- JSDoc comments on complex functions

### Documentation:
- README.md - Overview and setup
- SETUP.md - Detailed setup instructions
- API documentation in code
- Architecture documentation (this file)

## Summary

EcoMerce follows a clean, modular architecture that separates concerns into distinct layers:

1. **Presentation** - React components and pages
2. **State Management** - Zustand stores
3. **Hooks** - Custom React hooks
4. **Services** - Business logic
5. **API** - Server routes
6. **Data** - Firebase integration
7. **Utils** - Helper functions

This architecture ensures:
- ✅ Maintainability
- ✅ Scalability
- ✅ Testability
- ✅ Code reusability
- ✅ Clear separation of concerns
- ✅ Easy onboarding for new developers

For more details on specific components, refer to inline code comments and README files in each directory.
