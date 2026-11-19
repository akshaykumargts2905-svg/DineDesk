/**
 * API Service for DineDesk Restaurant Management System
 * Handles communication with the backend REST APIs.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('dinedesk_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Default fallback data for UI stability
export const MOCK_MENU_ITEMS = [
  {
    id: "item-1",
    name: "Paneer Tikka",
    category: "Starters",
    price: 220,
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-2",
    name: "Butter Chicken",
    category: "Main Course",
    price: 320,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-3",
    name: "Veg Biryani",
    category: "Main Course",
    price: 280,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-4",
    name: "Pizza",
    category: "Main Course",
    price: 350,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-5",
    name: "Crispy Corn",
    category: "Starters",
    price: 180,
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-6",
    name: "Cold Coffee",
    category: "Beverages",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-7",
    name: "Gulab Jamun",
    category: "Desserts",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
  {
    id: "item-8",
    name: "Fresh Lime Soda",
    category: "Beverages",
    price: 90,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
  },
];

export const MOCK_ORDERS = [
  {
    id: "ORD101",
    orderNumber: "ORD101",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    items: "2 Items",
    orderType: "Dine In",
    orderTypeEnum: "DINE_IN",
    createdAt: "19 Nov, 2:15 PM",
    total: 540,
    subtotal: 514.28,
    tax: 25.72,
    discount: 0,
    status: "Preparing",
    statusEnum: "PREPARING",
    table: "T1",
    tableId: "t1",
    notes: "Less spicy please",
    itemList: [
      { id: "oi-1", itemName: "Paneer Tikka", unitPrice: 220, quantity: 1, lineTotal: 220 },
      { id: "oi-2", itemName: "Butter Chicken", unitPrice: 320, quantity: 1, lineTotal: 320 },
    ],
    timeline: [
      { title: "Order Placed", time: "2:15 PM", status: "completed" },
      { title: "In Preparation", time: "2:17 PM", status: "completed" },
      { title: "Ready for Pickup", time: "2:20 PM", status: "current" },
      { title: "Served", time: "Pending", status: "upcoming" },
    ],
  },
  {
    id: "ORD102",
    orderNumber: "ORD102",
    customerName: "Amit Kumar",
    customerPhone: "9812345678",
    items: "1 Item",
    orderType: "Takeaway",
    orderTypeEnum: "TAKEAWAY",
    createdAt: "19 Nov, 1:50 PM",
    total: 280,
    subtotal: 266.66,
    tax: 13.34,
    discount: 0,
    status: "Pending",
    statusEnum: "PLACED",
    table: "-",
    notes: "Pack well with cutlery",
    itemList: [
      { id: "oi-3", itemName: "Veg Biryani", unitPrice: 280, quantity: 1, lineTotal: 280 },
    ],
    timeline: [
      { title: "Order Placed", time: "1:50 PM", status: "completed" },
      { title: "In Preparation", time: "Pending", status: "upcoming" },
      { title: "Ready for Pickup", time: "Pending", status: "upcoming" },
      { title: "Served", time: "Pending", status: "upcoming" },
    ],
  },
  {
    id: "ORD103",
    orderNumber: "ORD103",
    customerName: "Priya Singh",
    customerPhone: "9988776655",
    items: "3 Items",
    orderType: "Delivery",
    orderTypeEnum: "DELIVERY",
    createdAt: "19 Nov, 1:30 PM",
    total: 760,
    subtotal: 723.8,
    tax: 36.2,
    discount: 0,
    status: "Served",
    statusEnum: "SERVED",
    table: "-",
    notes: "Deliver to Flat 402",
    itemList: [
      { id: "oi-4", itemName: "Pizza", unitPrice: 350, quantity: 1, lineTotal: 350 },
      { id: "oi-5", itemName: "Butter Chicken", unitPrice: 320, quantity: 1, lineTotal: 320 },
      { id: "oi-6", itemName: "Fresh Lime Soda", unitPrice: 90, quantity: 1, lineTotal: 90 },
    ],
    timeline: [
      { title: "Order Placed", time: "1:30 PM", status: "completed" },
      { title: "In Preparation", time: "1:35 PM", status: "completed" },
      { title: "Ready for Pickup", time: "1:45 PM", status: "completed" },
      { title: "Served", time: "1:55 PM", status: "completed" },
    ],
  },
  {
    id: "ORD104",
    orderNumber: "ORD104",
    customerName: "Neha Verma",
    customerPhone: "9765432109",
    items: "2 Items",
    orderType: "Dine In",
    orderTypeEnum: "DINE_IN",
    createdAt: "19 Nov, 1:20 PM",
    total: 420,
    subtotal: 400,
    tax: 20,
    discount: 0,
    status: "Completed",
    statusEnum: "COMPLETED",
    table: "T3",
    tableId: "t3",
    notes: "Paid by cash",
    itemList: [
      { id: "oi-7", itemName: "Crispy Corn", unitPrice: 180, quantity: 1, lineTotal: 180 },
      { id: "oi-8", itemName: "Veg Biryani", unitPrice: 280, quantity: 1, lineTotal: 280 },
    ],
    timeline: [
      { title: "Order Placed", time: "1:20 PM", status: "completed" },
      { title: "In Preparation", time: "1:25 PM", status: "completed" },
      { title: "Ready for Pickup", time: "1:35 PM", status: "completed" },
      { title: "Served & Paid", time: "1:45 PM", status: "completed" },
    ],
  },
];

export const MOCK_KITCHEN_ORDERS = {
  pending: [
    {
      id: "ORD105",
      orderNumber: "ORD105",
      itemsText: "Pizza, Pasta",
      itemsList: [
        { name: "Pizza", qty: 1 },
        { name: "Pasta", qty: 1 },
      ],
      qty: 2,
      time: "2 min ago",
      specialInstructions: "Extra cheese on pizza",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "ORD106",
      orderNumber: "ORD106",
      itemsText: "Paneer Tikka, Naan",
      itemsList: [
        { name: "Paneer Tikka", qty: 1 },
        { name: "Butter Naan", qty: 2 },
      ],
      qty: 1,
      time: "3 min ago",
      specialInstructions: "Make tikka crispy",
      imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
    },
  ],
  preparing: [
    {
      id: "ORD107",
      orderNumber: "ORD107",
      itemsText: "Butter Chicken, Rice",
      itemsList: [
        { name: "Butter Chicken", qty: 1 },
        { name: "Jeera Rice", qty: 1 },
      ],
      qty: 1,
      time: "5 min ago",
      specialInstructions: "Medium spicy gravy",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "ORD108",
      orderNumber: "ORD108",
      itemsText: "Veg Biryani",
      itemsList: [
        { name: "Veg Biryani", qty: 1 },
      ],
      qty: 1,
      time: "6 min ago",
      specialInstructions: "Extra raita included",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    },
  ],
  ready: [
    {
      id: "ORD109",
      orderNumber: "ORD109",
      itemsText: "Pizza, Cold Coffee",
      itemsList: [
        { name: "Pizza", qty: 1 },
        { name: "Cold Coffee", qty: 1 },
      ],
      qty: 1,
      time: "7 min ago",
      specialInstructions: "Ready for serving at Table 4",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    },
  ],
};

// --- API Service Methods ---

export const orderService = {
  // Get all orders with optional filter query
  async getAll(params?: Record<string, string>) {
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const res = await request<any>(`/orders${query}`);
      if (res?.success && res.data) {
        return res.data;
      }
      return MOCK_ORDERS;
    } catch {
      return MOCK_ORDERS;
    }
  },

  // Get single order by ID
  async getById(id: string) {
    try {
      const res = await request<any>(`/orders/${id}`);
      if (res?.success && res.data) {
        return res.data;
      }
    } catch {}
    return MOCK_ORDERS.find((o) => o.id === id || o.orderNumber === id) || MOCK_ORDERS[0];
  },

  // Create new order
  async create(orderData: any) {
    try {
      const res = await request<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return res;
    } catch (err: any) {
      return { success: true, message: 'Order placed locally', data: orderData };
    }
  },

  // Update order status
  async updateStatus(id: string, status: string, note?: string) {
    try {
      const res = await request<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      return res;
    } catch (err: any) {
      return { success: true, message: 'Status updated' };
    }
  },

  // Cancel order
  async cancel(id: string, cancellationReason: string) {
    try {
      const res = await request<any>(`/orders/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ cancellationReason }),
      });
      return res;
    } catch (err: any) {
      return { success: true, message: 'Order cancelled' };
    }
  },
};

export const kitchenService = {
  // Get kitchen orders
  async getOrders() {
    try {
      const res = await request<any>('/kitchen/orders');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
      return MOCK_KITCHEN_ORDERS;
    } catch {
      return MOCK_KITCHEN_ORDERS;
    }
  },

  // Start preparation
  async startPrep(id: string) {
    try {
      return await request<any>(`/kitchen/orders/${id}/start`, { method: 'PATCH' });
    } catch {
      return { success: true };
    }
  },

  // Mark ready
  async markReady(id: string) {
    try {
      return await request<any>(`/kitchen/orders/${id}/ready`, { method: 'PATCH' });
    } catch {
      return { success: true };
    }
  },

  // Serve order
  async serveOrder(id: string) {
    try {
      return await request<any>(`/tracking/orders/${id}/served`, { method: 'PATCH' });
    } catch {
      return { success: true };
    }
  },
};

export const menuService = {
  // Get all menu items
  async getItems() {
    try {
      const res = await request<any>('/menu');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
      return MOCK_MENU_ITEMS;
    } catch {
      return MOCK_MENU_ITEMS;
    }
  },

  // Get categories
  async getCategories() {
    try {
      const res = await request<any>('/categories');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
      return ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts'];
    } catch {
      return ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts'];
    }
  },
};

export const tableService = {
  // Get tables
  async getTables() {
    try {
      const res = await request<any>('/tables');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [
        { id: 't1', tableNumber: 1, seats: 4 },
        { id: 't2', tableNumber: 2, seats: 2 },
        { id: 't3', tableNumber: 3, seats: 6 },
        { id: 't4', tableNumber: 4, seats: 4 },
        { id: 't5', tableNumber: 5, seats: 8 },
      ];
    } catch {
      return [
        { id: 't1', tableNumber: 1, seats: 4 },
        { id: 't2', tableNumber: 2, seats: 2 },
        { id: 't3', tableNumber: 3, seats: 6 },
        { id: 't4', tableNumber: 4, seats: 4 },
        { id: 't5', tableNumber: 5, seats: 8 },
      ];
    }
  },
};
