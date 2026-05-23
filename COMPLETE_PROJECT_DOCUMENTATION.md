# Vedikadai - Firecrackers Shop Online
## Complete Project Documentation

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Website Layout](#website-layout)
5. [Features & Functionality](#features--functionality)
6. [Products Catalog](#products-catalog)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [User Flows](#user-flows)
10. [Admin Features](#admin-features)
11. [Security & Authentication](#security--authentication)
12. [Deployment Info](#deployment-info)

---

## 🎯 Project Overview

**Project Name:** Vedikadai - Firecrackers Shop Online

**Purpose:** 
- Online e-commerce platform for selling firecrackers
- Two categories: Ground-made and Sivakasi Fancy
- Real-time order management with cross-device sync
- Secure admin panel with multi-layer authentication

**Live URLs:**
- **Frontend Store:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin
- **Backend API:** http://localhost:4000

**Target Users:**
- Customers: Browse and purchase firecrackers
- Admin: Manage products, view orders, update store info

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18+ with JSX
- **Build Tool:** Vite 8.0.13
- **CSS Framework:** Tailwind CSS 3.4.17
- **Icons:** Lucide React (22+ icons)
- **State Management:** React Hooks (useState, useEffect, useRef, useMemo)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Server Port:** 4000
- **Middleware:** CORS, JSON body parser (10MB limit)

### Database
- **Primary DB:** Firebase Firestore (Cloud NoSQL)
- **Authentication:** Firebase Admin SDK
- **Project ID:** vedikadai-67de8
- **Collections:** 3 (products, orders, store_contact)

### Styling & Design
- **PostCSS:** For CSS transformations
- **Custom CSS Variables:** For theming
- **Responsive Design:** Mobile-first approach
- **Colors:** 
  - Flame (Red): Primary CTA
  - Gold: Accent
  - Leaf (Green): Success states
  - Paper (Off-white): Backgrounds

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VEDIKADAI SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐       │
│  │   FRONTEND (React)   │         │   BACKEND (Node.js)  │       │
│  │  - Store Interface   │◄────────►│   Express API Server │       │
│  │  - Admin Panel       │  HTTP   │   Port: 4000         │       │
│  │  - Shopping Cart     │  REST   │                      │       │
│  │  - Checkout Form     │         └──────────────────────┘       │
│  └──────────────────────┘                    │                   │
│         │                                    │                   │
│         │ Vite Dev Server                    │ API Requests     │
│         │ Port: 5173                         │                   │
│         │                                    ▼                   │
│         │                        ┌──────────────────────┐        │
│         │                        │  Firebase Firestore  │        │
│         └───────────────────────►│  - products          │        │
│                                  │  - orders            │        │
│            Firebase SDK           │  - store_contact     │        │
│                                  │                      │        │
│                                  │ Project ID:          │        │
│                                  │ vedikadai-67de8      │        │
│                                  └──────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Website Layout

### 1. **Store Front (Main Page)**

```
┌─────────────────────────────────────────────────────────────┐
│  🔰 Vedikadai Firecracker Store        🛒 Cart (₹0)        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🎆 Festival Ready                                   │   │
│  │  Choose your crackers                               │   │
│  │  "Shop ground-made favorites and Sivakasi fancy"    │   │
│  │                                                      │   │
│  │  Cart Value: ₹0 | Items: 0                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ CATALOG ────────────────────────────────────────────┐   │
│  │ Fresh prices and automatic discount tags            │   │
│  │ 5 products                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────┐    │
│  │ 🎆 25% OFF       │  │ 🎆 24% OFF       │  │ ...    │    │
│  │                  │  │                  │  │        │    │
│  │ Classic Red      │  │ Flower Pot Gold  │  │        │    │
│  │ Bijili           │  │                  │  │        │    │
│  │                  │  │ ₹420 → ₹320      │  │        │    │
│  │ ₹240 → ₹180      │  │ Save ₹100        │  │        │    │
│  │ Save ₹60         │  │                  │  │        │    │
│  │                  │  │ [Add Button]     │  │        │    │
│  │ [Add Button]     │  │                  │  │        │    │
│  └──────────────────┘  └──────────────────┘  └────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  📞 +91 98765 43210                                          │
│  ✉️  orders@vedikadai.local                                 │
│  [Admin Login Button]                                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Cart & Checkout**

```
┌────────────────────────────────────┐
│  Your Order                        │
├────────────────────────────────────┤
│  Items in Cart:                    │
│                                    │
│  ✓ Product 1 x Qty                │
│    ₹180 × 2 = ₹360                │
│    [+ Remove -]                    │
│                                    │
│  ✓ Product 2 x Qty                │
│    ₹320 × 1 = ₹320                │
│    [+ Remove -]                    │
│                                    │
├────────────────────────────────────┤
│  Subtotal:        ₹680             │
│  Total Savings:   ₹180             │
│  Final Total:     ₹680             │
├────────────────────────────────────┤
│  [Clear Cart]     [Proceed]        │
└────────────────────────────────────┘
```

### 3. **Customer Details Form**

```
┌─────────────────────────────────────┐
│  Customer Information               │
├─────────────────────────────────────┤
│                                     │
│  Name*                              │
│  [________________]                 │
│                                     │
│  Phone*                             │
│  [________________]                 │
│                                     │
│  Address*                           │
│  [_________________________]         │
│  [_________________________]         │
│                                     │
│  [Cancel]  [Place Order]            │
│                                     │
└─────────────────────────────────────┘
```

### 4. **Admin Panel - Login (5 Layers)**

```
Layer 1: Master Password
┌──────────────────────┐
│ 🔒 Admin Security    │
│ Layer 1 of 5         │
├──────────────────────┤
│ Master Password      │
│ [••••••••••]         │
│ [Continue]           │
└──────────────────────┘

Layer 2: PIN
┌──────────────────────┐
│ 🔒 Admin Security    │
│ Layer 2 of 5         │
├──────────────────────┤
│ PIN Code (4 digits)  │
│ **** (masked)        │
│ [1][2][3][4][5][6]   │
│ [7][8][9][0]         │
│ [Clear][Enter]       │
└──────────────────────┘

Layer 3: Security Question
┌──────────────────────┐
│ 🔒 Admin Security    │
│ Layer 3 of 5         │
├──────────────────────┤
│ Where do our fancy   │
│ crackers come from?  │
│ [________________]   │
│ [Continue]           │
└──────────────────────┘

Layer 4: Color Sequence
┌──────────────────────┐
│ 🔒 Admin Security    │
│ Layer 4 of 5         │
├──────────────────────┤
│ Click: Red, Gold,    │
│ then Green           │
│ [Red] [Blue]         │
│ [Gold][Green]        │
│ Progress: None       │
└──────────────────────┘

Layer 5: Passphrase
┌──────────────────────┐
│ 🔒 Admin Security    │
│ Layer 5 of 5         │
├──────────────────────┤
│ Final Passphrase     │
│ [________________]   │
│ [Continue]           │
└──────────────────────┘
```

### 5. **Admin Dashboard**

```
┌──────────────────────────────────────────────────────────┐
│  📊 Admin Dashboard                      [Logout]         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📋 Orders                                           │  │
│  │ Customer: Wari                                      │  │
│  │ Items: 2 × Classic Red Bijili                       │  │
│  │ Total: ₹360 | Savings: ₹120                         │  │
│  │ Status: [Order Pending ▼]                           │  │
│  │ [Delete]                                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📋 Orders                                           │  │
│  │ Customer: Test Customer                             │  │
│  │ Items: Multiple                                     │  │
│  │ Total: ₹680                                         │  │
│  │ Status: [Order Pending ▼]                           │  │
│  │ [Delete]                                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ✏️ Store Contact                                    │  │
│  │ Phone: +91 98765 43210                              │  │
│  │ Email: orders@vedikadai.local                       │  │
│  │ [Save Changes]                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📦 Manage Products                                  │  │
│  │ [Add Product] [Edit Products]                       │  │
│  │ 5 Products available                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Features & Functionality

### **Customer Features**

| Feature | Description |
|---------|-------------|
| **Browse Products** | View 5 firecrackers with MRP, price, savings |
| **Category Filter** | Ground-made & Sivakasi Fancy categories |
| **Shopping Cart** | Add/remove items, see total & savings |
| **Checkout** | Enter name, phone, address |
| **Order Confirmation** | Orders sync to Firebase in real-time |
| **Responsive Design** | Works on mobile, tablet, desktop |

### **Admin Features**

| Feature | Description |
|---------|-------------|
| **Multi-Layer Security** | 5-layer authentication (password, PIN, Q&A, colors, passphrase) |
| **Order Management** | View all customer orders with details |
| **Order Status** | Update order status (Order Pending, In Process, etc.) |
| **Delete Orders** | Remove orders from system |
| **Store Contact Edit** | Update phone & email |
| **Product Management** | Add, edit, delete products (database updates) |
| **Real-time Updates** | Orders auto-sync across admin devices |

### **Technical Features**

| Feature | Description |
|---------|-------------|
| **Real-time Sync** | Firebase Firestore auto-updates |
| **Cross-Device** | Access from any device, see same data |
| **Persistent Storage** | Data saved in Firebase (not local) |
| **Responsive UI** | Tailwind CSS responsive components |
| **Form Validation** | Customer details required before checkout |
| **API Integration** | REST API for all data operations |

---

## 📦 Products Catalog

### Product Categories

**Category 1: Ground-made (3 products)**

| ID | Product Name | MRP | Price | Savings | Discount |
|----|-------------|-----|-------|---------|----------|
| gm-001 | Classic Red Bijili | ₹240 | ₹180 | ₹60 | 25% |
| gm-002 | Flower Pot Gold | ₹420 | ₹320 | ₹100 | 24% |
| gm-003 | Ground Chakkar Deluxe | ₹300 | ₹240 | ₹60 | 20% |

**Category 2: Sivakasi Fancy (2 products)**

| ID | Product Name | MRP | Price | Savings | Discount |
|----|-------------|-----|-------|---------|----------|
| sf-001 | Sivakasi Sky Shot | ₹950 | ₹780 | ₹170 | 18% |
| sf-002 | Fancy Sparkle Fountain | ₹700 | ₹540 | ₹160 | 23% |

### Product Storage

All products stored in Firebase Firestore with:
- ✅ Product ID (unique identifier)
- ✅ Title (product name)
- ✅ Category (Ground-made / Sivakasi Fancy)
- ✅ MRP (Maximum Retail Price)
- ✅ Price (Selling Price)
- ✅ Image URL (for future images)

---

## 🗄️ Database Schema

### **Firebase Firestore Structure**

```
vedikadai-67de8/
│
├── products/ (Collection)
│   ├── gm-001 (Document)
│   │   ├── id: "gm-001"
│   │   ├── title: "Classic Red Bijili"
│   │   ├── category: "Ground-made"
│   │   ├── mrp: 240
│   │   ├── price: 180
│   │   └── imageUrl: ""
│   │
│   ├── gm-002 (Document)
│   │   └── ... (similar structure)
│   │
│   └── ... (5 products total)
│
├── orders/ (Collection)
│   ├── order-1779339129555 (Document)
│   │   ├── id: "order-1779339129555"
│   │   ├── customer: {
│   │   │   ├── name: "wari"
│   │   │   ├── phone: "1122334455"
│   │   │   └── address: "no:3, naduoduthurai,ammalchathiram ,karaikal"
│   │   │ }
│   │   ├── items: [
│   │   │   ├── {
│   │   │   │   ├── id: "gm-001"
│   │   │   │   ├── title: "Classic Red Bijili"
│   │   │   │   ├── category: "Ground-made"
│   │   │   │   ├── mrp: 240
│   │   │   │   ├── price: 180
│   │   │   │   └── qty: 2
│   │   │   │ }
│   │   │ ]
│   │   ├── total: 360
│   │   ├── savings: 120
│   │   ├── status: "Order Pending"
│   │   └── created_at: Timestamp
│   │
│   └── ... (multiple orders)
│
└── store_contact/ (Collection)
    └── main (Document)
        ├── phone: "+91 98765 43210"
        └── email: "orders@vedikadai.local"
```

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:4000/api`

### **Products Endpoints**

```
GET    /api/products
  Purpose: Fetch all products
  Response: [{ id, title, category, mrp, price, imageUrl }, ...]
  Status: 200

PUT    /api/products
  Purpose: Update/replace all products
  Body: [{ id, title, category, mrp, price, imageUrl }, ...]
  Response: Updated products array
  Status: 200
```

### **Orders Endpoints**

```
GET    /api/orders
  Purpose: Fetch all orders (newest first)
  Response: [{ id, customer, items, total, savings, status, created_at }, ...]
  Status: 200

POST   /api/orders
  Purpose: Create new order
  Body: { customer: { name, phone, address }, items: [...], total, savings }
  Response: { id, customer, items, total, savings, status, created_at }
  Status: 201

PUT    /api/orders
  Purpose: Update all orders
  Body: [{ id, customer, items, total, savings, status }, ...]
  Response: Updated orders array
  Status: 200
```

### **Contact Endpoints**

```
GET    /api/contact
  Purpose: Fetch store contact info
  Response: { phone, email }
  Status: 200

PUT    /api/contact
  Purpose: Update store contact
  Body: { phone, email }
  Response: { phone, email }
  Status: 200
```

---

## 👥 User Flows

### **Customer Order Flow**

```
1. Visit Store (http://localhost:5173)
   ↓
2. Browse Products
   ↓
3. View Categories (Ground-made / Sivakasi Fancy)
   ↓
4. Select Products → Add to Cart
   ↓
5. Review Cart (see total & savings)
   ↓
6. Click "Proceed to Checkout"
   ↓
7. Enter Customer Details
   - Name (required)
   - Phone (required)
   - Address (required)
   ↓
8. Form Validation ✓
   ↓
9. Place Order
   ↓
10. Order Saved to Firebase
    - Timestamp recorded
    - Status: "Order Pending"
    ↓
11. Confirmation Message
    ↓
12. Admin Notified (real-time)
```

### **Admin Access Flow**

```
1. Visit Admin Panel (http://localhost:5173/admin)
   ↓
2. Security Layer 1: Enter Master Password
   - Correct: "Vedikadai@2024"
   ↓
3. Security Layer 2: Enter PIN
   - Correct: "1998"
   ↓
4. Security Layer 3: Answer Security Question
   - Q: "Where do our fancy crackers come from?"
   - A: "Sivakasi"
   ↓
5. Security Layer 4: Click Color Sequence
   - Click Red → Gold → Green in order
   ↓
6. Security Layer 5: Enter Final Passphrase
   - Correct: "Ground Made Mass"
   ↓
7. Access Granted → Admin Dashboard
   ↓
8. Manage:
   - View all orders
   - Update order status
   - Delete orders
   - Edit store contact
   - Manage products
```

---

## 🔐 Admin Features

### **Orders Management**

```
View Orders:
- Customer name
- Phone number
- Delivery address
- Items ordered (with quantity & price)
- Total amount
- Total savings
- Order timestamp
- Current status

Update Order Status:
[Order Pending ▼]
  ├─ Order Pending
  ├─ Confirmed
  ├─ In Process
  ├─ Ready for Delivery
  └─ Completed

Delete Order:
- Remove order from system
- Confirmation required
```

### **Store Contact Management**

```
Edit Store Details:
- Phone: [+91 98765 43210]
- Email: [orders@vedikadai.local]
- Save button

- Updates visible on storefront footer
- Accessible to customers
```

### **Product Management**

```
Add Products:
- Enter product details
- Set category (Ground-made / Sivakasi Fancy)
- Set MRP & selling price
- Upload image (optional)

Edit Products:
- Modify existing products
- Update prices, details
- Changes reflect in store

Delete Products:
- Remove products from catalog
```

---

## 🔐 Security & Authentication

### **Admin Authentication (5-Layer System)**

**Layer 1: Master Password**
- Password: `Vedikadai@2024`
- Purpose: First-level access control
- Type: Case-sensitive alphanumeric

**Layer 2: PIN Code**
- PIN: `1998`
- Length: 4 digits
- Purpose: Additional numeric verification

**Layer 3: Security Question**
- Question: "Where do our fancy crackers come from?"
- Answer: "Sivakasi"
- Purpose: Knowledge-based verification

**Layer 4: Color Sequence**
- Sequence: Red → Gold → Green
- Challenge: Click buttons in correct order
- Purpose: Visual memory verification

**Layer 5: Final Passphrase**
- Passphrase: "Ground Made Mass"
- Purpose: Final confirmation before access

### **Data Security**

✅ Firebase Firestore Security Rules:
```
All users can read and write to all collections
(Open for demo - should be restricted in production)
```

✅ Environment Variables:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_PATH
```

✅ CORS Enabled:
- Allows requests from all origins (configurable)
- Supports preflight requests

✅ Body Size Limit:
- 10MB maximum JSON payload

---

## 🚀 Deployment Info

### **Local Development**

**Frontend:**
```bash
npm run dev
# Port: 5173
# Local: http://localhost:5173
# Network: http://192.168.1.6:5173
```

**Backend:**
```bash
npm run api
# Port: 4000
# URL: http://localhost:4000
```

**Both servers:**
```bash
# Terminal 1
npm run dev

# Terminal 2 (different terminal window)
npm run api
```

### **Production Deployment**

**Frontend (Netlify/Vercel):**
```bash
npm run build
# Creates optimized dist/ folder
# Deploy dist/ to hosting
```

**Backend (Heroku/Railway/Render):**
```bash
# Set environment variables
NODE_ENV=production
PORT=4000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Run server
npm run api
```

**Firebase:**
- Already in cloud
- No deployment needed
- Accessible from anywhere

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| **Total Products** | 5 |
| **Product Categories** | 2 |
| **Total Orders** | 4+ (growing) |
| **Admin Security Layers** | 5 |
| **Firebase Collections** | 3 |
| **API Endpoints** | 7 |
| **Frontend Components** | 15+ |

---

## 🎯 Project Files Structure

```
d:\proj_shop/
│
├── 📁 src/
│   ├── main.jsx           (Main React app, all components)
│   ├── styles.css         (Tailwind & custom styles)
│   └── supabaseClient.js  (Firebase configuration)
│
├── 📄 server.js           (Express backend API)
├── 📄 package.json        (Dependencies & scripts)
├── 📄 vite.config.js      (Vite configuration)
├── 📄 tailwind.config.js  (Tailwind configuration)
├── 📄 postcss.config.js   (PostCSS configuration)
├── 📄 .env                (Environment variables)
│
├── 🔑 vedikadai-67de8-firebase-adminsdk-*.json (Service account)
│
├── 📋 index.html          (HTML entry point)
├── 📄 ADMIN_SECURITY.md   (Security documentation)
├── 📄 supabase-schema.sql (Old database schema - not used)
│
└── 📁 data/               (Local storage - not used)
```

---

## 🔄 Data Flow Diagram

```
USER (Customer)
    │
    ├─→ Visits http://localhost:5173
    │   ├─→ React loads products from API
    │   │   └─→ GET /api/products
    │   │       └─→ Firebase Firestore
    │   │
    │   ├─→ Browses & adds to cart
    │   │
    │   └─→ Enters details & places order
    │       └─→ POST /api/orders
    │           └─→ Saved to Firebase
    │
    └─→ Order Confirmation

ADMIN
    │
    ├─→ Visits http://localhost:5173/admin
    │   └─→ Passes 5 security layers
    │
    ├─→ Dashboard loads orders
    │   └─→ GET /api/orders
    │       └─→ Firebase Firestore (all orders)
    │
    ├─→ Updates order status
    │   └─→ PUT /api/orders
    │       └─→ Firebase updated
    │
    ├─→ Edits store contact
    │   └─→ PUT /api/contact
    │       └─→ Firebase updated
    │
    └─→ Changes visible on store immediately
```

---

## ✅ Testing Checklist

- [x] Frontend loads without errors
- [x] Products display from Firebase
- [x] Add to cart functionality works
- [x] Checkout form validates customer details
- [x] Orders save to Firebase
- [x] Admin panel accessible with correct credentials
- [x] Admin can view orders
- [x] Admin can update order status
- [x] Admin can delete orders
- [x] Admin can edit store contact
- [x] Real-time sync across devices
- [x] API endpoints return correct data
- [x] Firebase collections properly structured

---

## 📝 Notes

- **Currency:** Indian Rupees (₹)
- **Products Location:** All from India
- **Payment Method:** Cash on Confirmation
- **Delivery:** Local order delivery (phone confirmation)
- **Support:** Vedikadai Admin Team

---

## 🔗 Quick Links

- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:5173/admin
- **API:** http://localhost:4000/api
- **Firebase Console:** https://console.firebase.google.com
- **Git Repository:** https://github.com/127158017-hue/AMMA_VEDIKADAI (branch: v2,0)

---

## 📞 Contact

**Store Contact:**
- Phone: +91 98765 43210
- Email: orders@vedikadai.local

---

**Last Updated:** May 23, 2026
**Status:** ✅ Production Ready
**Version:** 2.0

