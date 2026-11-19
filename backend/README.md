# DineDesk Backend - Restaurant Order Coordination System

Complete REST API backend for DineDesk built with Node.js, Express.js (ES Modules), PostgreSQL (NeonDB), and Prisma ORM.

---

## 🚀 Features

- **Multi-Tenant Architecture:** Complete data isolation per restaurant (`restaurantId`).
- **Role-Based Access Control (RBAC):**
  - `RESTAURANT_ADMIN`: Full administrative control, staff management, financial reports.
  - `MANAGER`: Menu, table, staff, and order management.
  - `FRONT_OF_HOUSE`: Table management, order creation, tracking, serving, and notifications.
  - `KITCHEN_STAFF`: Kitchen Display System (KDS) order management (Accept, Start, Ready).
- **Atomic Transactions:** Order creation, status updates, and restaurant deletion are wrapped in Prisma transactions.
- **Auto-Notifications:** Automatically notifies front-of-house staff when an order is marked `READY` by the kitchen.
- **Order Lifecycle Enforcement:**
  `PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED` (or `CANCELLED`).
- **Server-Side Price Integrity:** Calculates subtotals, taxes, and totals securely using database snapshots.
- **CORS Enabled:** Ready for frontend connection (`http://localhost:3000` or custom origin).

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # 10 Database Models & Enums
│   └── prisma.config.ts    # Prisma CLI config
├── src/
│   ├── config/
│   │   └── db.js           # Prisma client singleton
│   ├── controllers/        # 11 Modular Controllers
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── menuItemController.js
│   │   ├── tableController.js
│   │   ├── orderController.js
│   │   ├── kitchenController.js
│   │   ├── trackingController.js
│   │   ├── notificationController.js
│   │   └── dashboardController.js
│   ├── routes/             # Express Routers
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── menuItemRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── kitchenRoutes.js
│   │   ├── trackingRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/         # Auth, Roles, Error & 404 Handlers
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── services/           # Background Notification Dispatcher
│   │   └── notificationService.js
│   ├── utils/              # Response Handler & Order Workflow Rules
│   │   ├── responseHandler.js
│   │   └── orderWorkflow.js
│   └── server.js           # Main Express App entry point
├── .env                    # Environment secrets
├── .env.example            # Environment sample template
├── API_DOCUMENTATION.md    # Detailed API Reference with schemas
└── package.json
```

---

## ⚙️ Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Ensure your `backend/.env` file exists with the following keys:
```env
DATABASE_URL="postgresql://neondb_owner:npg_XGLCmgW4rx9B@ep-nameless-cell-bem9sf1v-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=5000
JWT_SECRET=dinedesk_jwt_secret_key_2026_super_secure
JWT_EXPIRES_IN=7d
```

### 3. Generate Prisma Client & Sync Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will be accessible at:
- **API Base:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

---

## 🧪 Postman & Integration Testing Guide

To test the complete workflow step-by-step:

1. **Register Admin & Restaurant:**
   `POST http://localhost:5000/api/auth/register`
   - Copy the `token` from response and set it as `Bearer <token>` in your headers for subsequent requests.
2. **Add Categories & Items:**
   - `POST /api/categories` ➔ Create "Starters", "Main Course".
   - `POST /api/menu` ➔ Add items with `price`, `categoryId`.
3. **Add Dining Tables:**
   - `POST /api/tables` ➔ Add Table 1, Table 2.
4. **Create Order:**
   - `POST /api/orders` with `orderType: "DINE_IN"`, `tableId`, and `items`.
5. **Kitchen Display System (KDS):**
   - `GET /api/kitchen/orders` ➔ View active orders.
   - `PATCH /api/kitchen/orders/:id/accept` ➔ Accept order.
   - `PATCH /api/kitchen/orders/:id/start` ➔ Start preparation.
   - `PATCH /api/kitchen/orders/:id/ready` ➔ Mark ready (triggers notifications).
6. **Order Serving & Settlement:**
   - `PATCH /api/tracking/orders/:id/served` ➔ Mark served.
   - `PATCH /api/tracking/orders/:id/complete` ➔ Mark completed & paid.
7. **Dashboard:**
   - `GET /api/dashboard/stats` ➔ View real-time orders and revenue analytics.

For full payload details and response structures, see [API_DOCUMENTATION.md](file:///c:/Users/Akshay/Desktop/DineDesk/backend/API_DOCUMENTATION.md).
