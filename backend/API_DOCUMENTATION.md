# DineDesk - Complete REST API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require an HTTP header:
```http
Authorization: Bearer <your_jwt_token>
```

Consistent JSON Response Format:
- **Success:**
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {},
    "pagination": { "total": 10, "page": 1, "limit": 20, "totalPages": 1 }
  }
  ```
- **Error:**
  ```json
  {
    "success": false,
    "message": "Error description message"
  }
  ```

---

## Table of Contents
- [A. Health Check](#a-health-check)
- [B. Authentication APIs](#b-authentication-apis)
- [C. Restaurant Management APIs](#c-restaurant-management-apis)
- [D. Staff & User Management APIs](#d-staff--user-management-apis)
- [E. Menu Category APIs](#e-menu-category-apis)
- [F. Menu Item APIs](#f-menu-item-apis)
- [G. Dining Table APIs](#g-dining-table-apis)
- [H. Order Management APIs](#h-order-management-apis)
- [I. Kitchen Management APIs](#i-kitchen-management-apis)
- [J. Order Tracking APIs](#j-order-tracking-apis)
- [K. Staff Notification APIs](#k-staff-notification-apis)
- [L. Analytics & Dashboard APIs](#l-analytics--dashboard-apis)

---

## A. Health Check

### 1. Check API Status
- **Method:** `GET`
- **Endpoint:** `/health`
- **Auth:** None
- **Response:**
  ```json
  {
    "success": true,
    "message": "DineDesk Restaurant API is running smoothly",
    "timestamp": "2026-11-19T07:14:34.732Z"
  }
  ```

---

## B. Authentication APIs

### 1. Restaurant & Admin Registration
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Auth:** None
- **Body:**
  ```json
  {
    "restaurantName": "Royal Spice Dine",
    "address": "45 Park Street, Connaught Place",
    "phone": "9876543210",
    "name": "Akshay Kumar",
    "email": "admin@royalspice.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Restaurant and admin user registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "uuid",
        "name": "Akshay Kumar",
        "email": "admin@royalspice.com",
        "role": "RESTAURANT_ADMIN",
        "restaurantId": "uuid"
      },
      "restaurant": {
        "id": "uuid",
        "name": "Royal Spice Dine",
        "address": "45 Park Street, Connaught Place",
        "phone": "9876543210"
      }
    }
  }
  ```

### 2. User Login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Auth:** None
- **Body:**
  ```json
  {
    "email": "admin@royalspice.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "uuid",
        "name": "Akshay Kumar",
        "email": "admin@royalspice.com",
        "role": "RESTAURANT_ADMIN",
        "restaurantId": "uuid"
      }
    }
  }
  ```

### 3. Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Auth:** Bearer Token (Any active role)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "id": "uuid",
      "name": "Akshay Kumar",
      "email": "admin@royalspice.com",
      "role": "RESTAURANT_ADMIN",
      "restaurantId": "uuid",
      "restaurant": {
        "id": "uuid",
        "name": "Royal Spice Dine",
        "address": "45 Park Street, Connaught Place",
        "phone": "9876543210"
      }
    }
  }
  ```

### 4. Logout
- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Auth:** Bearer Token
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## C. Restaurant Management APIs

### 1. Get Logged-in Restaurant Details
- **Method:** `GET`
- **Endpoint:** `/restaurants/my`
- **Auth:** Bearer Token

### 2. Update Restaurant Details
- **Method:** `PUT`
- **Endpoint:** `/restaurants/my`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "name": "Royal Spice Bistro & Bar",
    "address": "Plot 12, Cyber City",
    "phone": "9812345678"
  }
  ```

### 3. Delete Restaurant
- **Method:** `DELETE`
- **Endpoint:** `/restaurants/my`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN` only)

---

## D. Staff & User Management APIs

Roles supported: `RESTAURANT_ADMIN`, `MANAGER`, `FRONT_OF_HOUSE`, `KITCHEN_STAFF`

### 1. Create Staff Account
- **Method:** `POST`
- **Endpoint:** `/users`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN` only)
- **Body:**
  ```json
  {
    "name": "Chef Sanjeev",
    "email": "chef@royalspice.com",
    "password": "ChefPassword123!",
    "role": "KITCHEN_STAFF"
  }
  ```

### 2. Get All Staff
- **Method:** `GET`
- **Endpoint:** `/users?role=KITCHEN_STAFF&isActive=true&search=Sanjeev&page=1&limit=20`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

### 3. Get Single Staff
- **Method:** `GET`
- **Endpoint:** `/users/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

### 4. Update Staff
- **Method:** `PUT`
- **Endpoint:** `/users/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "name": "Head Chef Sanjeev",
    "role": "KITCHEN_STAFF"
  }
  ```

### 5. Activate / Deactivate Staff
- **Method:** `PATCH`
- **Endpoint:** `/users/:id/status`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "isActive": false
  }
  ```

### 6. Delete Staff
- **Method:** `DELETE`
- **Endpoint:** `/users/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN` only)

---

## E. Menu Category APIs

### 1. Create Category
- **Method:** `POST`
- **Endpoint:** `/categories`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "name": "Starters & Appetizers",
    "description": "Crispy and savoury appetizers"
  }
  ```

### 2. Get All Categories
- **Method:** `GET`
- **Endpoint:** `/categories?includeItems=true&search=Starters`
- **Auth:** Bearer Token (All authenticated roles)

### 3. Get Category by ID
- **Method:** `GET`
- **Endpoint:** `/categories/:id`
- **Auth:** Bearer Token (All authenticated roles)

### 4. Update Category
- **Method:** `PUT`
- **Endpoint:** `/categories/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

### 5. Delete Category
- **Method:** `DELETE`
- **Endpoint:** `/categories/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- *Note:* Cannot delete a category that still contains menu items.

---

## F. Menu Item APIs

### 1. Add Food Item
- **Method:** `POST`
- **Endpoint:** `/menu`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "name": "Paneer Tikka",
    "description": "Charcoal grilled cottage cheese skewers",
    "price": 280,
    "imageUrl": "https://example.com/paneer-tikka.jpg",
    "categoryId": "category-uuid",
    "prepTimeMinutes": 15,
    "isAvailable": true
  }
  ```

### 2. Get All Food Items
- **Method:** `GET`
- **Endpoint:** `/menu?categoryId=uuid&isAvailable=true&search=Tikka&page=1&limit=50`
- **Auth:** Bearer Token (All authenticated roles)

### 3. Get Single Food Item
- **Method:** `GET`
- **Endpoint:** `/menu/:id`
- **Auth:** Bearer Token (All authenticated roles)

### 4. Update Food Item
- **Method:** `PUT`
- **Endpoint:** `/menu/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

### 5. Toggle Food Item Availability
- **Method:** `PATCH`
- **Endpoint:** `/menu/:id/availability`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`, `KITCHEN_STAFF`)
- **Body:**
  ```json
  {
    "isAvailable": false
  }
  ```

### 6. Delete Food Item
- **Method:** `DELETE`
- **Endpoint:** `/menu/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

---

## G. Dining Table APIs

### 1. Add Table
- **Method:** `POST`
- **Endpoint:** `/tables`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:**
  ```json
  {
    "tableNumber": 4,
    "seats": 6,
    "isActive": true
  }
  ```

### 2. Get All Tables
- **Method:** `GET`
- **Endpoint:** `/tables?isActive=true&includeCurrentOrder=true`
- **Auth:** Bearer Token (All authenticated roles)
- *Note:* Returns `isOccupied` and `currentOrder` information for each table.

### 3. Get Table Details
- **Method:** `GET`
- **Endpoint:** `/tables/:id`
- **Auth:** Bearer Token (All authenticated roles)

### 4. Update Table
- **Method:** `PUT`
- **Endpoint:** `/tables/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)

### 5. Activate / Deactivate Table
- **Method:** `PATCH`
- **Endpoint:** `/tables/:id/status`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`)
- **Body:** `{ "isActive": false }`

### 6. Delete Table
- **Method:** `DELETE`
- **Endpoint:** `/tables/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN` only)

---

## H. Order Management APIs

Order workflow states:
`PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED`
(Or `CANCELLED`)

### 1. Create Order
- **Method:** `POST`
- **Endpoint:** `/orders`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`, `FRONT_OF_HOUSE`)
- **Body:**
  ```json
  {
    "orderType": "DINE_IN",
    "tableId": "table-uuid",
    "customerName": "Rahul Sharma",
    "customerPhone": "9876543210",
    "notes": "Less spicy please",
    "taxPercent": 5,
    "discount": 50,
    "items": [
      {
        "menuItemId": "menu-item-uuid-1",
        "quantity": 2,
        "specialInstructions": "Extra green chutney"
      },
      {
        "menuItemId": "menu-item-uuid-2",
        "quantity": 1
      }
    ]
  }
  ```
- **Response (201 Created):**
  Calculates subtotal, tax, discount, total and creates initial history entry atomically.

### 2. Get All Orders
- **Method:** `GET`
- **Endpoint:** `/orders?status=PLACED&orderType=DINE_IN&page=1&limit=20`
- **Auth:** Bearer Token (All authenticated roles)

### 3. Get Order Details
- **Method:** `GET`
- **Endpoint:** `/orders/:id`
- **Auth:** Bearer Token (All authenticated roles)
- *Includes:* items, statusHistory, table, createdBy

### 4. Update Order Details
- **Method:** `PUT`
- **Endpoint:** `/orders/:id`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`, `FRONT_OF_HOUSE`)
- **Body:**
  ```json
  {
    "customerName": "Rahul V. Sharma",
    "notes": "Customer requested bill on table"
  }
  ```

### 5. Update Order Status
- **Method:** `PATCH`
- **Endpoint:** `/orders/:id/status`
- **Auth:** Bearer Token
- **Body:**
  ```json
  {
    "status": "ACCEPTED",
    "note": "Front of house accepted order"
  }
  ```

### 6. Cancel Order
- **Method:** `PATCH`
- **Endpoint:** `/orders/:id/cancel`
- **Auth:** Bearer Token (`RESTAURANT_ADMIN`, `MANAGER`, `FRONT_OF_HOUSE`)
- **Body:**
  ```json
  {
    "cancellationReason": "Customer changed their mind before food preparation"
  }
  ```

### 7. Get Order Status History
- **Method:** `GET`
- **Endpoint:** `/orders/:id/history`
- **Auth:** Bearer Token

---

## I. Kitchen Management APIs

Designed specifically for the Kitchen Display System (KDS).

### 1. Get Kitchen Orders
- **Method:** `GET`
- **Endpoint:** `/kitchen/orders?status=PREPARING`
- **Auth:** Bearer Token (`KITCHEN_STAFF`, `MANAGER`, `RESTAURANT_ADMIN`)
- *Default:* Returns all active kitchen orders in `PLACED`, `ACCEPTED`, and `PREPARING` status sorted chronologically (FIFO).

### 2. Get Single Kitchen Order Details
- **Method:** `GET`
- **Endpoint:** `/kitchen/orders/:id`
- **Auth:** Bearer Token (`KITCHEN_STAFF`, `MANAGER`, `RESTAURANT_ADMIN`)

### 3. Kitchen Accept Order
- **Method:** `PATCH`
- **Endpoint:** `/kitchen/orders/:id/accept`
- **Auth:** Bearer Token (`KITCHEN_STAFF`, `MANAGER`, `RESTAURANT_ADMIN`)
- **Body (optional):** `{ "note": "Chef starting soon" }`

### 4. Kitchen Start Food Preparation
- **Method:** `PATCH`
- **Endpoint:** `/kitchen/orders/:id/start`
- **Auth:** Bearer Token (`KITCHEN_STAFF`, `MANAGER`, `RESTAURANT_ADMIN`)
- **Body (optional):** `{ "note": "On fire" }`

### 5. Kitchen Mark Order Ready
- **Method:** `PATCH`
- **Endpoint:** `/kitchen/orders/:id/ready`
- **Auth:** Bearer Token (`KITCHEN_STAFF`, `MANAGER`, `RESTAURANT_ADMIN`)
- **Body (optional):** `{ "note": "Plated on counter" }`
- *Action:* Automatically creates notifications for all active `FRONT_OF_HOUSE` staff.

---

## J. Order Tracking APIs

Designed for Front-of-House and Waiter mobile/tablet tracking.

### 1. Get Active Tracking Orders
- **Method:** `GET`
- **Endpoint:** `/tracking/orders?orderType=DINE_IN`
- **Auth:** Bearer Token (`FRONT_OF_HOUSE`, `MANAGER`, `RESTAURANT_ADMIN`)
- *Returns:* Orders in `PLACED`, `ACCEPTED`, `PREPARING`, `READY`, `SERVED`.

### 2. Track Specific Order
- **Method:** `GET`
- **Endpoint:** `/tracking/orders/:id`
- **Auth:** Bearer Token (`FRONT_OF_HOUSE`, `MANAGER`, `RESTAURANT_ADMIN`)

### 3. Mark Order as Served
- **Method:** `PATCH`
- **Endpoint:** `/tracking/orders/:id/served`
- **Auth:** Bearer Token (`FRONT_OF_HOUSE`, `MANAGER`, `RESTAURANT_ADMIN`)
- **Body (optional):** `{ "note": "Delivered to Table #4" }`

### 4. Complete Order & Settle Bill
- **Method:** `PATCH`
- **Endpoint:** `/tracking/orders/:id/complete`
- **Auth:** Bearer Token (`FRONT_OF_HOUSE`, `MANAGER`, `RESTAURANT_ADMIN`)
- **Body:**
  ```json
  {
    "paymentStatus": "PAID",
    "paymentMethod": "UPI",
    "note": "Paid via GooglePay UPI"
  }
  ```

---

## K. Staff Notification APIs

### 1. Get My Notifications
- **Method:** `GET`
- **Endpoint:** `/notifications?isRead=false&page=1&limit=20`
- **Auth:** Bearer Token

### 2. Get Single Notification
- **Method:** `GET`
- **Endpoint:** `/notifications/:id`
- **Auth:** Bearer Token

### 3. Mark Notification as Read
- **Method:** `PATCH`
- **Endpoint:** `/notifications/:id/read`
- **Auth:** Bearer Token

### 4. Mark All Notifications as Read
- **Method:** `PATCH`
- **Endpoint:** `/notifications/read-all`
- **Auth:** Bearer Token

### 5. Delete Notification
- **Method:** `DELETE`
- **Endpoint:** `/notifications/:id`
- **Auth:** Bearer Token

---

## L. Analytics & Dashboard APIs

Restricted to `RESTAURANT_ADMIN` and `MANAGER`.

### 1. Dashboard Core Statistics
- **Method:** `GET`
- **Endpoint:** `/dashboard/stats`
- **Auth:** Bearer Token
- **Response Example:**
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
      "totalOrders": 124,
      "todayOrders": 32,
      "pendingOrders": 3,
      "acceptedOrders": 2,
      "preparingOrders": 4,
      "readyOrders": 2,
      "servedOrders": 5,
      "completedOrders": 105,
      "cancelledOrders": 3,
      "totalSales": 78450.50,
      "todaySales": 14200.00
    }
  }
  ```

### 2. Recent Orders
- **Method:** `GET`
- **Endpoint:** `/dashboard/recent-orders?limit=10`
- **Auth:** Bearer Token

### 3. Sales Financial Summary
- **Method:** `GET`
- **Endpoint:** `/dashboard/sales`
- **Auth:** Bearer Token
- *Returns:* Breakdown by payment method (UPI, CASH, CARD), breakdown by order type (DINE_IN, TAKEAWAY, DELIVERY), total revenue, subtotal, taxes, discounts, and average order value.

### 4. Status Breakdown Summary
- **Method:** `GET`
- **Endpoint:** `/dashboard/order-summary`
- **Auth:** Bearer Token
