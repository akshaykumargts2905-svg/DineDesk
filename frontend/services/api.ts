export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "RESTAURANT_ADMIN" | "MANAGER" | "FRONT_OF_HOUSE" | "KITCHEN_STAFF";
  isDemo?: boolean;
  restaurantId: string;
  restaurant?: { id: string; name: string; address?: string | null; phone?: string | null };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem("dinedesk_token");

export function setSession(token: string, user: User) {
  localStorage.setItem("dinedesk_token", token);
  localStorage.setItem("dinedesk_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("dinedesk_token");
  localStorage.removeItem("dinedesk_user");
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the DineDesk API. Check the backend connection.", 0);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new ApiError(body?.message || `Request failed (${response.status})`, response.status);
  }
  return body as T;
}

async function data<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await request<ApiResponse<T>>(endpoint, options);
  if (response.data === undefined) return undefined as T;
  return response.data;
}

const json = (method: string, payload?: unknown): RequestInit => ({
  method,
  ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
});

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    data<{ token: string; user: User }>("/auth/login", json("POST", credentials)),
  demoLogin: () => data<{ token: string; user: User }>("/auth/demo", json("POST", {})),
  register: (payload: {
    restaurantName: string;
    address?: string;
    phone?: string;
    name: string;
    email: string;
    password: string;
  }) => data<{ token: string; user: User }>("/auth/register", json("POST", payload)),
  me: () => data<User>("/auth/me"),
  logout: () => data<undefined>("/auth/logout", json("POST")),
};

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  isAvailable: boolean;
  prepTimeMinutes?: number | null;
  categoryId?: string;
  category?: { id: string; name: string } | null;
}
export interface MenuCategory {
  id: string;
  name: string;
  description?: string | null;
  _count?: { menuItems: number };
}
export interface DiningTable { id: string; tableNumber: number; seats?: number | null; isActive: boolean }
export interface OrderItem {
  id: string;
  itemName: string;
  unitPrice: number | string;
  quantity: number;
  lineTotal: number | string;
  specialInstructions?: string | null;
}
export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  status: "PLACED" | "CONFIRMED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "COMPLETED" | "CANCELLED";
  paymentStatus: string;
  paymentMethod?: string | null;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
  notes?: string | null;
  table?: { id: string; tableNumber: number } | null;
  items: OrderItem[];
  statusHistory?: { fromStatus?: string | null; toStatus: string; note?: string | null; changedAt: string }[];
  createdAt: string;
}

const queryString = (params?: Record<string, string>) => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : "";
};

export const orderService = {
  getAll: (params?: Record<string, string>) => data<Order[]>(`/orders${queryString(params)}`),
  list: (params?: Record<string, string>) => request<ApiResponse<Order[]>>(`/orders${queryString(params)}`),
  getById: (id: string) => data<Order>(`/orders/${encodeURIComponent(id)}`),
  create: (payload: unknown) => data<Order>("/orders", json("POST", payload)),
  update: (id: string, payload: unknown) => data<Order>(`/orders/${id}`, json("PUT", payload)),
  updateStatus: (id: string, status: string, note?: string) =>
    data<Order>(`/orders/${id}/status`, json("PATCH", { status, note })),
  cancel: (id: string, cancellationReason: string) =>
    data<Order>(`/orders/${id}/cancel`, json("PATCH", { cancellationReason })),
  getHistory: (id: string) => data<{ order: Pick<Order, "id" | "orderNumber" | "status">; history: NonNullable<Order["statusHistory"]> }>(`/orders/${id}/history`),
};

export const kitchenService = {
  getOrders: () => data<Order[]>("/kitchen/orders"),
  accept: (id: string) => data<Order>(`/kitchen/orders/${id}/accept`, json("PATCH", {})),
  startPrep: (id: string) => data<Order>(`/kitchen/orders/${id}/start`, json("PATCH", {})),
  markReady: (id: string) => data<Order>(`/kitchen/orders/${id}/ready`, json("PATCH", {})),
  serveOrder: (id: string) => data<Order>(`/tracking/orders/${id}/served`, json("PATCH")),
};

export const trackingService = {
  getOrders: () => data<Order[]>("/tracking/orders"),
  getById: (id: string) => data<Order>(`/tracking/orders/${encodeURIComponent(id)}`),
  markServed: (id: string) => data<Order>(`/tracking/orders/${encodeURIComponent(id)}/served`, json("PATCH", {})),
  complete: (id: string, paymentMethod: string) =>
    data<Order>(`/tracking/orders/${encodeURIComponent(id)}/complete`, json("PATCH", { paymentStatus: "PAID", paymentMethod })),
};

export const menuService = {
  getItems: () => data<MenuItem[]>("/menu?isAvailable=true&limit=100"),
  getAllItems: () => data<MenuItem[]>("/menu?limit=100"),
  createItem: (payload: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    prepTimeMinutes?: number;
    isAvailable: boolean;
  }) => data<MenuItem>("/menu", json("POST", payload)),
  setAvailability: (id: string, isAvailable: boolean) =>
    data<MenuItem>(`/menu/${encodeURIComponent(id)}/availability`, json("PATCH", { isAvailable })),
  getCategories: () => data<MenuCategory[]>("/categories"),
  createCategory: (payload: { name: string; description?: string }) =>
    data<MenuCategory>("/categories", json("POST", payload)),
};

export const tableService = {
  getTables: () => data<DiningTable[]>("/tables?isActive=true"),
  getAll: () => data<DiningTable[]>("/tables"),
  create: (payload: { tableNumber: number; seats?: number; isActive: boolean }) =>
    data<DiningTable>("/tables", json("POST", payload)),
  setActive: (id: string, isActive: boolean) =>
    data<DiningTable>(`/tables/${encodeURIComponent(id)}/status`, json("PATCH", { isActive })),
};

export const dashboardService = {
  getStats: () => data<Record<string, number>>("/dashboard/stats"),
  getRecentOrders: (limit = 5) => data<Order[]>(`/dashboard/recent-orders?limit=${limit}`),
};

export const notificationService = {
  getAll: () => data<{ notifications: unknown[]; unreadCount: number }>("/notifications?limit=5"),
  markAllRead: () => data<{ updatedCount: number }>("/notifications/read-all", json("PATCH")),
};
