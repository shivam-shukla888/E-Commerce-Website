# LuxeMart — Full-Stack E-Commerce Platform

A production-grade, secure, and visually stunning modern e-commerce web platform built with **React 18 + Vite**, **Node.js + Express**, and **SQLite**. Designed with luxury dark aesthetics, integer paise monetary calculations, atomic inventory reservation transactions, role-based access control, and complete simulation sandboxing.

---

## Architecture Overview

```
e-commerce-website/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Hero, ProductCard, Footer, etc.)
│   │   ├── pages/              # Views (HomePage, Catalogue, ProductDetail, Cart, Checkout, Account, Admin)
│   │   ├── index.css           # Modern design system (tokens, glassmorphism, responsive grid)
│   │   ├── App.jsx             # Client state orchestration & responsive routing
│   │   └── main.jsx            # DOM entry
│   ├── index.html              # HTML shell with Google Fonts
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy
├── server/                     # Backend API (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── config/             # Environment variables & business constants
│   │   ├── db/                 # Database connection (better-sqlite3), normalized schema, seed script
│   │   ├── middleware/         # JWT auth, RBAC admin check, rate limiting, validation, error handler
│   │   ├── routes/             # REST API routes (auth, products, categories, orders, admin)
│   │   ├── utils/              # Currency formatting (INR) & integer paise arithmetic
│   │   ├── app.js              # Express app with Helmet, CORS, and rate limiters
│   │   └── server.js           # Server listener entry point
│   ├── tests/                  # Automated integration & unit tests (Node test runner)
│   └── package.json
├── .env.example                # Safe environment configuration template
├── .gitignore                  # Git ignore rules for DB, build, logs, and secrets
├── package.json                # Root package.json with npm workspaces
└── README.md                   # Full documentation
```

---

## Key Features

### 🛍️ Customer Experience & Storefront
- **Immersive Hero & Spotlight Sections**: Dynamic hero banner with key brand statistics, Autumn/Winter collection badges, and call-to-actions.
- **Curated Department Showcase**: Categorized browsing across Electronics, Studio Audio, Fashion & Apparel, Smart Wearables, and Ergonomic Home Living.
- **Live Search & Multi-Attribute Filtering**: Real-time keyword search, category filter pills, price slider (up to ₹1,50,000), in-stock only toggle, and sorting (Featured, Price: Low-to-High, Price: High-to-Low, Highest Rated, Newest).
- **Comprehensive Product Details**: High-resolution imagery, verified customer reviews counter, stock availability badges, interactive quantity selector, and detailed technical specifications tables.
- **Interactive Shopping Cart**: Dynamic quantity updates, real-time subtotal computation, coupon simulation engine (`LUXE10`, `VIP20`), and a free express shipping progress bar (Free above ₹999).
- **Simulated Checkout Experience**: Shipping address form with validation, sandbox payment method selector (Instant UPI simulation, Cash on Delivery, and Test Card Sandbox), and server-side quote verification.
- **Order Confirmation & Invoicing**: Order tracking numbers (`ORD-YYYYMMDD-XXXX`), detailed price receipts, estimated delivery timeline, and one-click printable invoices.
- **Customer Account Portal**: Profile editing, lifetime purchase analytics, and order history with live status badges.

### 🛡️ Admin Dashboard & Management Console
- **Role-Protected Routing**: Restricted to administrator accounts verified by server-side JWT authentication. Ordinary customers receive `403 Forbidden`.
- **Live Business KPIs**: Real-time metrics for total revenue (₹), total orders placed, catalog product count, and low-stock alerts (&le; 5 units remaining).
- **Product CRUD & Stock Adjuster**:
  - Add new products with image URLs, categories, prices, and descriptions.
  - Edit existing product specifications.
  - Quick-adjust stock levels (+ / -) directly from the dashboard table.
  - Safe deletion safeguards preventing removal of items linked to customer orders.
- **Order Fulfillment Management**: Filter orders by status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) and instantly update fulfillment statuses.

---

## Security Implementation

1. **Integer Arithmetic for Money**:
   - Stored and computed in **integer paise** (1 INR = 100 paise) on the server.
   - Client-submitted totals are **never** trusted; subtotals, GST (18%), shipping fees, and totals are re-calculated on the backend.
2. **Atomic Inventory Transactions**:
   - Orders are processed inside atomic SQLite transactions (`BEGIN TRANSACTION ... COMMIT`).
   - Verifies stock quantity before placement and immediately decrements inventory; out-of-stock purchases are rejected with descriptive messages.
3. **Customer Order Isolation**:
   - Customers can only access their own orders (`WHERE user_id = req.user.id`).
   - Cross-user order inspection attempts result in strict `403 Forbidden` responses.
4. **Authentication & Password Security**:
   - Passwords hashed using `bcryptjs` with 10 salt rounds.
   - Password hashes and internal database identifiers are filtered out of all API responses.
   - Brute-force rate limiting applied to `/api/auth/*` routes.
5. **Defensive API Hardening**:
   - `helmet` security headers configured.
   - Strict CORS origin whitelisting (`http://localhost:5173`).
   - Parameterized SQLite queries (`better-sqlite3`) to completely mitigate SQL injection risks.
   - Centralized error handler suppressing stack traces in production environments.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. Clone or open the project repository:
   ```bash
   git clone https://github.com/shivam-shukla888/E-Commerce-Website.git
   cd E-Commerce-Website
   ```

2. Install dependencies across workspaces:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

4. Initialize database and seed demo products:
   ```bash
   npm run seed
   ```

---

## Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```
- **Storefront (Vite Client)**: [http://localhost:5173](http://localhost:5173)
- **Backend API (Express Server)**: [http://localhost:5000](http://localhost:5000)

### Run Separately
- **Backend only**:
  ```bash
  npm run dev:server
  ```
- **Frontend only**:
  ```bash
  npm run dev:client
  ```

### Production Build
```bash
npm run build
npm run start
```

---

## Seeded Demo Credentials

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ecommerce.test` | `Admin@12345` | Access Admin Dashboard, product CRUD, and order status updates |
| **Customer** | `customer@ecommerce.test` | `Customer@12345` | Standard shopping, checkout simulation, and order history |

*Note: You can also use the one-click **"Demo Customer"** and **"Demo Admin"** preset buttons on the Sign In page for instant access.*

---

## API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer account
- `POST /api/auth/login` — Sign in and obtain JWT session token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update user address and phone details

### Products & Categories (`/api/products`, `/api/categories`)
- `GET /api/categories` — List all categories with product counts
- `GET /api/products` — Filter products (`search`, `category`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, `limit`)
- `GET /api/products/:identifier` — Get detailed product info, specifications, and related items

### Orders (`/api/orders`)
- `POST /api/orders` — Atomically verify stock, calculate totals, and place order (requires auth)
- `GET /api/orders/my-orders` — View orders belonging exclusively to the authenticated customer
- `GET /api/orders/:id` — View specific order receipt (restricted to owner or admin)

### Admin Operations (`/api/admin`) *(Requires Admin Role)*
- `GET /api/admin/metrics` — Store revenue, total orders, active products, and low stock count
- `GET /api/admin/orders` — View all store orders across all users with status filter
- `PUT /api/admin/orders/:id/status` — Update order fulfillment status
- `POST /api/admin/products` — Create a new catalog product
- `PUT /api/admin/products/:id` — Update product details
- `PUT /api/admin/products/:id/stock` — Quick inventory stock level adjustment
- `DELETE /api/admin/products/:id` — Delete product (safeguarded against active orders)

---

## Automated Test Suite

Run the full suite of unit and integration tests:
```bash
npm test
```

### Verified Test Coverage:
- **Authentication**: Validation checks, bcrypt password hashing, duplicate email prevention, invalid credentials rejection, and session token verification.
- **Calculations & Currency**: Integer paise math integrity, Indian Rupee formatters, free shipping threshold qualification, and tax calculation.
- **Orders & Inventory**: Atomic transaction stock deduction, out-of-stock rejection, and strict customer order isolation.
- **Product Management**: Query search, multi-category filtering, pagination, and admin permission enforcement.

---

## Known Limitations & Production Notes

1. **Simulation Sandbox**:
   - Payment checkout is strictly simulated. No actual payment gateway (e.g. Stripe, Razorpay) is linked to prevent real monetary charges.
2. **Database Engine**:
   - The application uses **SQLite** (`better-sqlite3`) in WAL mode, ideal for local setups, demonstration, and single-instance deployments. For large distributed deployments, migrating to PostgreSQL with a connection pool is recommended.
3. **Session Cookies vs Bearer Tokens**:
   - Currently, Bearer token authorization in headers is utilized for seamless cross-origin and headless testing. In high-security multi-domain production environments, HTTP-only SameSite cookies with CSRF tokens should be configured.