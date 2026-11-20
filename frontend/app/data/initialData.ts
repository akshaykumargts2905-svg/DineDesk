export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  prepTimeMinutes: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isCompleted?: boolean;
}

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivering" | "Served" | "Completed" | "Cancelled";
export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "UPI" | "CASH" | "CARD";

export interface Order {
  id: string;
  displayId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  timeAgo: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface DiningTable {
  id: string;
  tableNumber: number;
  seats: number;
  isOccupied: boolean;
  currentOrderId?: string;
}

export interface StaffRole {
  role: "RESTAURANT_ADMIN" | "MANAGER" | "FRONT_OF_HOUSE" | "KITCHEN_STAFF";
  title: string;
  name: string;
  avatar: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "kitchen" | "alert";
  timestamp: string;
  isRead: boolean;
  orderId?: string;
}

export const INITIAL_RESTAURANT = {
  name: "DineDesk Bistro",
  tagline: "Good Food, Good Mood!",
  address: "45 Park Street, Connaught Place",
  phone: "+91 98765 43210",
  isOpen: true,
  taxPercent: 5,
};

export const INITIAL_STAFF_ROLES: StaffRole[] = [
  { role: "RESTAURANT_ADMIN", title: "Restaurant Admin", name: "Alex Morgan", avatar: "👤" },
  { role: "MANAGER", title: "Floor Manager", name: "Sarah Jenkins", avatar: "👔" },
  { role: "FRONT_OF_HOUSE", title: "Front of House / Waiter", name: "David Chen", avatar: "🧑‍💼" },
  { role: "KITCHEN_STAFF", title: "Head Chef", name: "Chef Marcus", avatar: "👨‍🍳" },
];

export const CATEGORIES = [
  "All Items",
  "Burgers",
  "Pizzas",
  "Pastas",
  "Sides & Starters",
  "Beverages",
  "Desserts",
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Classic Cheeseburger",
    category: "Burgers",
    price: 180,
    description: "Grilled tender patty, cheddar slice, crisp lettuce, secret relish",
    prepTimeMinutes: 12,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
    isVeg: false,
    isAvailable: true,
  },
  {
    id: "m2",
    name: "Double Smash Burger",
    category: "Burgers",
    price: 240,
    description: "Two crispy smashed beef/veg patties, melted double cheese, caramelized onions",
    prepTimeMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m3",
    name: "Margherita Woodfired Pizza",
    category: "Pizzas",
    price: 260,
    description: "San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, extra virgin olive oil",
    prepTimeMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m4",
    name: "Spicy Pepperoni & Jalapeño Pizza",
    category: "Pizzas",
    price: 340,
    description: "Crispy beef pepperoni, pickled jalapeños, smoked mozzarella & hot honey",
    prepTimeMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop",
    isVeg: false,
    isAvailable: true,
  },
  {
    id: "m5",
    name: "Creamy Truffle Fettuccine",
    category: "Pastas",
    price: 290,
    description: "Handmade fettuccine ribbons in silky wild mushroom truffle cream sauce",
    prepTimeMinutes: 16,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m6",
    name: "Golden Peri Peri Fries",
    category: "Sides & Starters",
    price: 120,
    description: "Crispy double-fried golden russet potatoes dusted with house peri peri spice",
    prepTimeMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m7",
    name: "Crispy Mozzarella Sticks",
    category: "Sides & Starters",
    price: 160,
    description: "Panko crusted herb mozzarella batons with house marinara dip",
    prepTimeMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m8",
    name: "Iced Caramel Cold Brew",
    category: "Beverages",
    price: 110,
    description: "16-hour slow steeped Arabica coffee infused with sea-salt caramel drizzle",
    prepTimeMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m9",
    name: "Fresh Mint Lime Sparkler",
    category: "Beverages",
    price: 90,
    description: "Crushed spearmint, zesty key lime, sparkling soda, raw cane sugar",
    prepTimeMinutes: 3,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "m10",
    name: "Molten Belgian Choco Lava",
    category: "Desserts",
    price: 160,
    description: "Warm dark chocolate fondant cake with a decadent melting molten center",
    prepTimeMinutes: 7,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop",
    isVeg: true,
    isAvailable: true,
  },
];

export const INITIAL_TABLES: DiningTable[] = [
  { id: "t1", tableNumber: 1, seats: 4, isOccupied: true, currentOrderId: "ORD101" },
  { id: "t2", tableNumber: 2, seats: 2, isOccupied: false },
  { id: "t3", tableNumber: 3, seats: 6, isOccupied: true, currentOrderId: "ORD102" },
  { id: "t4", tableNumber: 4, seats: 4, isOccupied: false },
  { id: "t5", tableNumber: 5, seats: 8, isOccupied: false },
  { id: "t6", tableNumber: 6, seats: 2, isOccupied: false },
  { id: "t7", tableNumber: 7, seats: 4, isOccupied: false },
  { id: "t8", tableNumber: 8, seats: 6, isOccupied: false },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "101",
    displayId: "ORD101",
    customerId: "cust-01",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98765 11223",
    tableNumber: 1,
    orderType: "DINE_IN",
    items: [
      { id: "i1", menuItemId: "m3", name: "Margherita Woodfired Pizza", price: 260, quantity: 1, notes: "Extra crispy crust" },
      { id: "i2", menuItemId: "m8", name: "Iced Caramel Cold Brew", price: 110, quantity: 1 },
    ],
    subtotal: 370,
    tax: 18.5,
    discount: 0,
    totalAmount: 388.5,
    status: "Preparing",
    paymentStatus: "UNPAID",
    notes: "Customer seated near window, requested less ice in beverage.",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    timeAgo: "2 min ago",
    timeline: [
      { status: "Pending", timestamp: "16:36", note: "Order placed by Waiter" },
      { status: "Preparing", timestamp: "16:38", note: "Chef Marcus started preparation" },
    ],
  },
  {
    id: "102",
    displayId: "ORD102",
    customerId: "cust-02",
    customerName: "Amit Kumar",
    customerPhone: "+91 98223 44556",
    tableNumber: 3,
    orderType: "DINE_IN",
    items: [
      { id: "i3", menuItemId: "m2", name: "Double Smash Burger", price: 240, quantity: 1, notes: "No onions" },
    ],
    subtotal: 240,
    tax: 12,
    discount: 0,
    totalAmount: 252,
    status: "Pending",
    paymentStatus: "UNPAID",
    notes: "Allergy notice: No raw onions.",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    timeAgo: "3 min ago",
    timeline: [
      { status: "Pending", timestamp: "16:35", note: "Order placed from POS" },
    ],
  },
  {
    id: "103",
    displayId: "ORD103",
    customerId: "cust-03",
    customerName: "Priya Singh",
    customerPhone: "+91 97112 33445",
    tableNumber: 2,
    orderType: "DINE_IN",
    items: [
      { id: "i4", menuItemId: "m5", name: "Creamy Truffle Fettuccine", price: 290, quantity: 1 },
      { id: "i5", menuItemId: "m7", name: "Crispy Mozzarella Sticks", price: 160, quantity: 1 },
      { id: "i6", menuItemId: "m9", name: "Fresh Mint Lime Sparkler", price: 90, quantity: 1 },
    ],
    subtotal: 540,
    tax: 27,
    discount: 50,
    totalAmount: 517,
    status: "Completed",
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    notes: "Regular patron. Applied Member ₹50 discount.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeAgo: "5 min ago",
    timeline: [
      { status: "Pending", timestamp: "16:15", note: "Order created" },
      { status: "Preparing", timestamp: "16:18", note: "Kitchen prep in progress" },
      { status: "Ready", timestamp: "16:28", note: "Ready on service counter" },
      { status: "Served", timestamp: "16:30", note: "Served to Table #2" },
      { status: "Completed", timestamp: "16:34", note: "Bill settled via GPay UPI" },
    ],
  },
  {
    id: "104",
    displayId: "ORD104",
    customerId: "cust-04",
    customerName: "Rohit Verma",
    customerPhone: "+91 99881 22334",
    orderType: "DELIVERY",
    items: [
      { id: "i7", menuItemId: "m6", name: "Golden Peri Peri Fries", price: 120, quantity: 1 },
    ],
    subtotal: 120,
    tax: 6,
    discount: 0,
    totalAmount: 126,
    status: "Delivering",
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    notes: "Leave with front desk security.",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    timeAgo: "7 min ago",
    timeline: [
      { status: "Pending", timestamp: "16:20", note: "Online delivery order" },
      { status: "Preparing", timestamp: "16:22", note: "Fryer station active" },
      { status: "Ready", timestamp: "16:28", note: "Packed in heat bag" },
      { status: "Delivering", timestamp: "16:31", note: "Handed over to rider" },
    ],
  },
  {
    id: "105",
    displayId: "ORD105",
    customerId: "cust-05",
    customerName: "Neha Gupta",
    customerPhone: "+91 98445 66778",
    tableNumber: 5,
    orderType: "DINE_IN",
    items: [
      { id: "i8", menuItemId: "m4", name: "Spicy Pepperoni & Jalapeño Pizza", price: 340, quantity: 1 },
      { id: "i9", menuItemId: "m10", name: "Molten Belgian Choco Lava", price: 160, quantity: 1 },
    ],
    subtotal: 500,
    tax: 25,
    discount: 0,
    totalAmount: 525,
    status: "Completed",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    notes: "Served dessert warm with vanilla scoop.",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeAgo: "10 min ago",
    timeline: [
      { status: "Pending", timestamp: "16:05", note: "Order placed" },
      { status: "Preparing", timestamp: "16:08", note: "Pizza oven loaded" },
      { status: "Ready", timestamp: "16:20", note: "Food ready" },
      { status: "Served", timestamp: "16:22", note: "Served to Table #5" },
      { status: "Completed", timestamp: "16:29", note: "Cash payment settled" },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Order Ready for Pickup",
    message: "Order #ORD104 has been packed and is ready at the delivery dispatch counter.",
    type: "kitchen",
    timestamp: "2 min ago",
    isRead: false,
    orderId: "104",
  },
  {
    id: "n2",
    title: "Preparation Started",
    message: "Chef Marcus started preparing Order #ORD101 (Table 1: Margherita Pizza).",
    type: "order",
    timestamp: "4 min ago",
    isRead: false,
    orderId: "101",
  },
  {
    id: "n3",
    title: "Table 2 Bill Settled",
    message: "Priya Singh settled bill of ₹517 via UPI. Table 2 is now vacant.",
    type: "order",
    timestamp: "5 min ago",
    isRead: false,
    orderId: "103",
  },
];
