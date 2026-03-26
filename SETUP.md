# EcoMerce Setup Guide

Complete step-by-step guide to get your EcoMerce platform up and running.

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (or yarn/pnpm)
- **Firebase Account**: https://firebase.google.com
- **Text Editor**: VS Code, WebStorm, etc.
- **Git**: For version control

## Phase 1: Project Setup

### 1.1 Install Dependencies

```bash
cd d:\vedikadai
npm install
```

This installs all required packages:
- Next.js
- React & React DOM
- Firebase SDK
- Tailwind CSS
- Zustand
- Framer Motion
- XLSX for Excel
- And more...

Verify installation:
```bash
npm -v
node -v
```

## Phase 2: Firebase Configuration

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `ecommerce` (or your choice)
4. Accept terms and create project
5. Wait for project creation (usually 1-2 minutes)

### 2.2 Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable providers:
   - **Email/Password**: Click, enable it
   - **Google**: Click, enable it and choose project support email

### 2.3 Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose region (closest to your users)
4. Start in "Production mode" (we'll configure rules later)
5. Wait for creation

### 2.4 Create Storage Bucket

1. Go to "Storage"
2. Click "Get started"
3. Choose region (same as Firestore)
4. Keep default security rules for now

### 2.5 Get Firebase Config

1. Go to Project Settings (gear icon)
2. Under "Your apps", click "Web" to create a web app
3. Register app with nickname "ecommerce-web"
4. Copy the Firebase config object

Your config will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Phase 3: Environment Setup

### 3.1 Create .env.local File

In project root, create `.env.local`:

```bash
touch .env.local
```

### 3.2 Add Firebase Credentials

Copy your Firebase config values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Razorpay (optional - for testing)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **Important**: Never commit `.env.local` to version control

## Phase 4: Firebase Security Rules

### 4.1 Firestore Security Rules

Go to Firestore Database → Rules tab and paste:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if false;
    }

    // Products collection (public read, admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders collection
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
                            (resource.data.userId == request.auth.uid || 
                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
    }
  }
}
```

Click "Publish"

### 4.2 Storage Security Rules

Go to Storage → Rules tab and paste:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read for product images
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Allow authenticated uploads
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Click "Publish"

## Phase 5: Database Seeding

### 5.1 Manual Product Creation

1. Go to Firestore Console
2. Create new collection: `products`
3. Add document with sample data:

```json
{
  "name": "Sample Product",
  "category": "Electronics",
  "price": 999,
  "stock": 50,
  "description": "This is a sample product",
  "imageUrl": "https://via.placeholder.com/300x300",
  "createdAt": "2026-03-15T00:00:00Z",
  "updatedAt": "2026-03-15T00:00:00Z"
}
```

### 5.2 Create Admin User

1. Go to Authentication
2. Create new user with email and password
3. In Firestore, create user document in `users/{uid}`:

```json
{
  "id": "{uid}",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "createdAt": "2026-03-15T00:00:00Z",
  "updatedAt": "2026-03-15T00:00:00Z"
}
```

## Phase 6: Run Development Server

### 6.1 Start the App

```bash
npm run dev
```

You should see:
```
> ecommerce@1.0.0 dev
> next dev

  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

### 6.2 Access the Application

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. You should see the EcoMerce homepage

## Phase 7: Test the Application

### 7.1 Customer Journey

1. Click "Sign Up"
2. Enter name, email, password
3. Fill password requirements: min 8 chars, uppercase, lowercase, number
4. Submit to create account
5. Login with your credentials
6. Browse products
7. Add items to cart
8. Go to checkout (requires address)
9. Complete order

### 7.2 Admin Journey

1. Login with admin account
2. Navigate to `/admin`
3. Try adding a product manually
4. Try uploading product image
5. Use Excel import feature
6. View all orders

## Phase 8: Excel Import Setup

### 8.1 Sample Excel Template

Create a CSV file with columns:
```
product_id,name,category,price,description,image_url,stock
SKU001,Laptop,Electronics,45000,High-performance laptop,https://example.com/laptop.jpg,10
SKU002,Mouse,Electronics,500,Wireless mouse,https://example.com/mouse.jpg,50
```

### 8.2 Import Products

1. Go to Admin → Import Excel
2. Click "Download Template" to see format
3. Create your own file matching the format
4. Upload to import all products

## Phase 9: Razorpay Integration (Optional)

### 9.1 Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Create account and verify
3. Get API keys from Settings → API Keys

### 9.2 Update Environment

Add to `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=key_XXXXX
RAZORPAY_SECRET=secret_XXXXX
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Firebase Connection Error

```bash
# Check env variables are correct
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID

# Verify Firebase is enabled
# Check Firebase Console → Firestore is created
# Check Firebase Console → Authentication is enabled
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Check TypeScript
npm run type-check
```

### Images Not Showing

- Check Firebase Storage bucket exists
- Check image URL is correct
- Verify Storage security rules allow reads
- Check browser console for errors

## Development Tips

### Enable Debugging

Add to `.env.local`:
```env
DEBUG=*
```

### Test Different Roles

1. Create user with `role: 'customer'` for customer testing
2. Create user with `role: 'admin'` for admin testing

### React DevTools

Install React Developer Tools browser extension for debugging component state

### Firebase Console Monitoring

- Keep Firebase Console open to monitor database changes
- Watch Firestore for data synchronization
- Check Storage for uploaded images

## Next Steps

1. **Customize branding**: Update colors, logo, company name
2. **Add more products**: Use Excel import for bulk data
3. **Configure email**: Set up email notifications
4. **Deploy**: Push to GitHub and deploy to Vercel
5. **Monitor**: Set up analytics and error tracking

## Production Deployment

### Using Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Using Docker

```bash
# Build image
docker build -t ecommerce .

# Run container
docker run -p 3000:3000 ecommerce
```

## Security Checklist

- [ ] Environment variables are set
- [ ] .env.local is in .gitignore
- [ ] Firebase security rules are configured
- [ ] Admin user is created
- [ ] HTTPS is enabled (production)
- [ ] Rate limiting is configured
- [ ] Error monitoring is set up
- [ ] Backups are scheduled

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Firebase Console for errors
3. Check browser console (F12)
4. Check terminal for build errors
5. Read Firebase and Next.js documentation

---

For detailed API documentation, see the main [README.md](./README.md)
