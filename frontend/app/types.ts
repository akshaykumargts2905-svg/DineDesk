/**
 * Shared types and helpers for the DineDesk order workflow.
 * Import from here, not from page.tsx, to avoid Next.js page-export conflicts.
 */

export type Role = "Admin" | "Kitchen Staff" | "Waiter" | "Customer";

/**
 * 6-Step Order Workflow
 *  1. Pending   – Customer / Waiter creates the order
 *  2. Confirmed – Waiter clicks "Confirm & Send to Kitchen"
 *  3. Accepted  – Kitchen clicks "Accept"
 *  4. Preparing – Kitchen clicks "Start Cooking"
 *  5. Ready     – Kitchen clicks "Mark Ready" → waiter notified
 *  6. Completed – Waiter clicks "Mark Served"
 */
export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type Order = {
  id: string;
  customerId: string;
  name: string;
  table: number;
  items: string;
  qty: number;
  status: OrderStatus;
  time: string;
  note: string;
  history: { status: OrderStatus; actor: string; at: string }[];
};

export const ROLE_MENUS: Record<Role, string[]> = {
  Admin:          ["Dashboard", "New Order", "All Orders", "Kitchen", "Tracking"],
  Waiter:         ["New Order", "All Orders", "Tracking"],
  "Kitchen Staff":["Kitchen"],
  Customer:       ["New Order", "All Orders", "Tracking"],
};

export const statusColor = (s: string) =>
  s === "Pending"   ? "bg-gray-100   text-gray-600"   :
  s === "Confirmed" ? "bg-blue-100   text-blue-700"   :
  s === "Accepted"  ? "bg-indigo-100 text-indigo-700" :
  s === "Preparing" ? "bg-orange-100 text-orange-600" :
  s === "Ready"     ? "bg-purple-100 text-purple-700" :
  s === "Completed" ? "bg-green-100  text-green-700"  :
  s === "Cancelled" ? "bg-red-100    text-red-600"    :
                      "bg-gray-100   text-gray-600";
