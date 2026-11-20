"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MobileTopMenu from "./components/MobileTopMenu";
import HomeView from "./components/HomeView";
import NewOrderView from "./components/NewOrderView";
import AllOrderView from "./components/AllOrderView";
import KitchenView from "./components/KitchenView";
import TrackingView from "./components/TrackingView";
import { type Role, type Order, type OrderStatus, ROLE_MENUS } from "./types";

export const currentUser = {
  id: "cust-03",
  name: "Priya Singh",
  role: "CUSTOMER",
};

const MENU = [
  { name: "Veg Burger",       price: 149, emoji: "🍔" },
  { name: "French Fries",     price: 89,  emoji: "🍟" },
  { name: "Margherita Pizza", price: 249, emoji: "🍕" },
  { name: "Paneer Tikka",     price: 199, emoji: "🍢" },
  { name: "Pasta Alfredo",    price: 219, emoji: "🍝" },
  { name: "Cold Coffee",      price: 99,  emoji: "🥤" },
];

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const INITIAL: Order[] = [
  {
    id: "#ORD101", customerId: "cust-01", name: "Rahul Sharma", table: 7,
    items: "2 x Veg Burger, 1 x Cold Coffee", qty: 3,
    status: "Preparing", time: "2 min ago", note: "no onions",
    history: [
      { status: "Pending",   actor: "Waiter David",   at: "16:30" },
      { status: "Confirmed", actor: "Waiter David",   at: "16:31" },
      { status: "Accepted",  actor: "Chef Marcus",    at: "16:32" },
      { status: "Preparing", actor: "Chef Marcus",    at: "16:33" },
    ],
  },
  {
    id: "#ORD102", customerId: "cust-02", name: "Amit Kumar", table: 9,
    items: "1 x Pasta Alfredo", qty: 1,
    status: "Confirmed", time: "3 min ago", note: "",
    history: [
      { status: "Pending",   actor: "Waiter David",   at: "16:29" },
      { status: "Confirmed", actor: "Waiter David",   at: "16:30" },
    ],
  },
  {
    id: "#ORD103", customerId: "cust-03", name: "Priya Singh", table: 3,
    items: "2 x Margherita Pizza", qty: 2,
    status: "Completed", time: "5 min ago", note: "",
    history: [
      { status: "Pending",   actor: "Waiter David",   at: "16:15" },
      { status: "Confirmed", actor: "Waiter David",   at: "16:16" },
      { status: "Accepted",  actor: "Chef Marcus",    at: "16:17" },
      { status: "Preparing", actor: "Chef Marcus",    at: "16:18" },
      { status: "Ready",     actor: "Chef Marcus",    at: "16:28" },
      { status: "Completed", actor: "Waiter David",   at: "16:30" },
    ],
  },
  {
    id: "#ORD104", customerId: "cust-04", name: "Rohit Verma", table: 5,
    items: "1 x Paneer Tikka, 2 x French Fries", qty: 3,
    status: "Ready", time: "7 min ago", note: "",
    history: [
      { status: "Pending",   actor: "Customer",       at: "16:20" },
      { status: "Confirmed", actor: "Waiter David",   at: "16:21" },
      { status: "Accepted",  actor: "Chef Marcus",    at: "16:22" },
      { status: "Preparing", actor: "Chef Marcus",    at: "16:23" },
      { status: "Ready",     actor: "Chef Marcus",    at: "16:30" },
    ],
  },
  {
    id: "#ORD105", customerId: "cust-05", name: "Neha Gupta", table: 2,
    items: "2 x Cold Coffee", qty: 2,
    status: "Pending", time: "10 min ago", note: "extra sugar",
    history: [
      { status: "Pending",   actor: "Customer",       at: "16:08" },
    ],
  },
];

const icons: Record<string, string> = {
  Dashboard:    "🏠",
  "New Order":  "➕",
  "All Orders": "📋",
  Kitchen:      "👨‍🍳",
  Tracking:     "🔔",
};

export default function App() {
  const [role, setRole]     = useState<Role>("Customer");
  const [view, setView]     = useState("All Orders");
  const [orders, setOrders] = useState<Order[]>(INITIAL);
  const [isOnline, setIsOnline] = useState(true);

  // New-order form
  const [customer, setCustomer] = useState("");
  const [table,    setTable]    = useState("");
  const [note,     setNote]     = useState("");
  const [cart,     setCart]     = useState<{ name: string; price: number; qty: number }[]>([]);
  const [trackId,  setTrackId]  = useState("#ORD101");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ── Status transitions ───────────────────────────────────────
  const advance = (id: string, status: OrderStatus, actor: string) =>
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? { ...o, status, history: [...o.history, { status, actor, at: now() }] }
          : o
      )
    );

  const actorLabel: Record<Role, string> = {
    Admin:          "Admin Alex",
    Waiter:         "Waiter David",
    "Kitchen Staff":"Chef Marcus",
    Customer:       "Customer",
  };

  const confirmOrder = (id: string) => advance(id, "Confirmed", actorLabel[role]);
  const acceptOrder  = (id: string) => advance(id, "Accepted",  actorLabel[role]);
  const startCooking = (id: string) => advance(id, "Preparing", actorLabel[role]);
  const markReady    = (id: string) => advance(id, "Ready",     actorLabel[role]);
  const markServed   = (id: string) => advance(id, "Completed", actorLabel[role]);
  const cancelOrder  = (id: string) => advance(id, "Cancelled", actorLabel[role]);

  // ── New order ─────────────────────────────────────────────────
  const addToCart = (item: { name: string; price: number }) =>
    setCart(prev => {
      const found = prev.find(c => c.name === item.name);
      return found
        ? prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { ...item, qty: 1 }];
    });

  const placeOrder = () => {
    if (!customer.trim() || !table.trim() || cart.length === 0) {
      alert("Please fill customer name, table number, and add at least one item.");
      return;
    }
    const newOrder: Order = {
      id:         "#ORD" + (100 + orders.length + 1),
      customerId: currentUser.id,
      name:       customer.trim(),
      table:      Number(table),
      items:      cart.map(c => c.qty + " x " + c.name).join(", "),
      qty:        cart.reduce((s, c) => s + c.qty, 0),
      status:     "Pending",
      time:       "Just now",
      note:       note.trim(),
      history:    [{ status: "Pending", actor: actorLabel[role], at: now() }],
    };
    setOrders(prev => [newOrder, ...prev]);
    setTrackId(newOrder.id);
    setCustomer(""); setTable(""); setNote(""); setCart([]);
    setView("All Orders");
  };

  // ── Role navigation ───────────────────────────────────────────
  const menus = ROLE_MENUS[role];
  const handleSetRole = (r: Role) => {
    setRole(r);
    if (!ROLE_MENUS[r].includes(view)) setView(ROLE_MENUS[r][0]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        view={view} setView={setView} menus={menus} icons={icons}
        role={role} setRole={handleSetRole}
        isOnline={isOnline} setIsOnline={setIsOnline}
      />
      <MobileTopMenu menus={menus} view={view} setView={setView} icons={icons} />

      <div className="flex-1 md:ml-64 p-6 pt-16 md:pt-6">

        {view === "Dashboard" && (
          <HomeView
            orders={orders} setView={setView} setTrackId={setTrackId}
            isOnline={isOnline} setIsOnline={setIsOnline}
          />
        )}

        {view === "New Order" && (
          <NewOrderView
            customer={customer} setCustomer={setCustomer}
            table={table} setTable={setTable}
            note={note} setNote={setNote}
            cart={cart} setCart={setCart}
            addToCart={addToCart} placeOrder={placeOrder}
            total={total} menu={MENU} role={role}
          />
        )}

        {view === "All Orders" && (
          <AllOrderView
            orders={orders} setTrackId={setTrackId} setView={setView}
            role={role}
            currentUser={currentUser}
            confirmOrder={confirmOrder}
            markServed={markServed}
            cancelOrder={cancelOrder}
          />
        )}

        {view === "Kitchen" && (
          <KitchenView
            orders={orders}
            acceptOrder={acceptOrder}
            startCooking={startCooking}
            markReady={markReady}
          />
        )}

        {view === "Tracking" && (
          <TrackingView
            orders={orders} trackId={trackId} setTrackId={setTrackId}
            role={role}
            confirmOrder={confirmOrder}
            markServed={markServed}
            setView={setView}
          />
        )}
      </div>
    </div>
  );
}
