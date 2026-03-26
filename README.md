# EcoMerce - Full-Stack E-Commerce Platform

A modern, production-ready e-commerce platform built with Next.js, Firebase, and Tailwind CSS. Features include user authentication, product management, shopping cart, order processing, and admin dashboard with Excel import capabilities.

## Features

### Customer Features
- ✅ User registration and login with Firebase Auth
- ✅ Browse products with filters (category, price)
- ✅ Product search and details
- ✅ Shopping cart management
- ✅ Secure checkout process
- ✅ Order tracking
- ✅ Responsive mobile-first UI

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Product CRUD operations
- ✅ Bulk product import from Excel
- ✅ Product image upload
- ✅ Order management
- ✅ Role-based access control

### Technical Features
- ✅ Next.js 16 with App Router
- ✅ TypeScript for type safety
- ✅ Firebase Authentication
- ✅ Firebase Firestore database
- ✅ Firebase Storage for images
- ✅ Zustand for state management
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Excel import with XLSX library
- ✅ Razorpay payment integration (placeholder)

## Project Structure

```
ecommerce/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin pages
│   │   ├── auth/             # Authentication pages
│   │   ├── cart/             # Cart page
│   │   ├── checkout/         # Checkout page
│   │   ├── product/          # Product detail page
│   │   ├── products/         # Products listing page
│   │   ├── orders/           # Order pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable React components
│   │   ├── auth/             # Auth forms
│   │   ├── products/         # Product components
│   │   ├── cart/             # Cart components
│   │   ├── admin/            # Admin components
│   │   └── common/           # Common components
│   ├── lib/
│   │   ├── firebase/         # Firebase config & admin
│   │   └── utils/            # Utility functions
│   ├── services/             # Business logic
│   │   ├── auth/             # Auth service
│   │   ├── products/         # Product services
│   │   ├── orders/           # Order service
│   │   └── payments/         # Payment service
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript types
│   ├── utils/                # Helper functions
│   ├── constants/            # App constants
│   ├── middleware/           # Next.js middleware
│   └── styles/               # Global styles
├── public/                   # Static assets
├── .env.example              # Example environment variables
├── .env.local                # Local environment (not tracked)
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── README.md                 # This file
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Firebase project
- (Optional) Razorpay account

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password and Google Sign-in)
3. Create Firestore database
4. Create Storage bucket for images
5. Copy your Firebase config

### Step 3: Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key (optional)
RAZORPAY_SECRET=your_razorpay_secret (optional)

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Customer Flow

1. **Sign Up**: Register with email/password or Google
2. **Browse**: Explore products with filters
3. **Add to Cart**: Click products to add items
4. **Checkout**: Enter delivery address and review order
5. **Payment**: Complete payment (Razorpay integration)
6. **Track Orders**: View order status

### Admin Flow

1. **Login**: Sign in with admin account
2. **Dashboard**: View overview and quick stats
3. **Add Products**: Create products manually or via Excel
4. **Manage**: Edit, update, or delete products
5. **Orders**: View and manage customer orders

### Excel Import Format

Create an Excel file with these columns:

| product_id | name | category | price | description | image_url | stock |
|------------|------|----------|-------|-------------|-----------|-------|
| SKU001 | Product Name | Electronics | 999 | Description | URL | 50 |

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)
- `POST /api/products/upload` - Upload image
- `POST /api/products/import` - Import from Excel

### Orders
- `GET /api/orders` - Get orders (filtered by user)
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## Firestore Database Schema

### Collections

**users/**
```typescript
{
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  createdAt: timestamp
  updatedAt: timestamp
}
```

**products/**
```typescript
{
  id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

**orders/**
```typescript
{
  id: string
  userId: string
  products: OrderProduct[]
  totalAmount: number
  paymentStatus: 'pending' | 'success' | 'failed'
  paymentId: string (optional)
  deliveryAddress: Address
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Key Technologies

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Data**: XLSX (Excel)
- **Payments**: Razorpay (placeholder)

## Security Considerations

- ✅ Environment variables for sensitive data
- ✅ Firebase security rules (implement in production)
- ✅ User authentication with Firebase
- ✅ Role-based access control
- ✅ HTTPS recommended
- ✅ Input validation on client and server

## Production Checklist

- [ ] Set up Firebase security rules
- [ ] Configure Razorpay live keys
- [ ] Set up email verification
- [ ] Implement rate limiting
- [ ] Add error monitoring (Sentry)
- [ ] Set up analytics
- [ ] Configure CDN for images
- [ ] Enable CORS properly
- [ ] Set up automated backups
- [ ] Create admin user account
- [ ] Test payment flow
- [ ] Set up SSL certificate

## Common Issues

### Firebase connection fails
- Verify environment variables are correct
- Check Firebase project is active
- Ensure database and storage are created

### Images not uploading
- Check Firebase Storage bucket exists
- Verify storage security rules allow uploads
- Check file size limits

### Login not working
- Ensure Firebase Auth enabled
- Check email verification requirements
- Verify password requirements

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review Firebase docs

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics
- [ ] Inventory management
- [ ] Multiple currencies
- [ ] Promotional codes
- [ ] Multi-vendor support
- [ ] Mobile app (React Native)

---

Built with ❤️ using Next.js, Firebase, and Tailwind CSS

