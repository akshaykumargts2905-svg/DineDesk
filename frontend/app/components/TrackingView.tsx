"use client";
import type { Order, Role } from "../types";

interface TrackingViewProps {
  orders: Order[];
  trackId: string;
  setTrackId: (id: string) => void;
  role: Role;
  confirmOrder: (id: string) => void;
  markServed:   (id: string) => void;
  setView: (view: string) => void;
}

// 6 steps
const STEPS = [
  { key: "Pending",   label: "Pending",   sub: "Order created",          icon: "🛒" },
  { key: "Confirmed", label: "Confirmed", sub: "Sent to kitchen",         icon: "📤" },
  { key: "Accepted",  label: "Accepted",  sub: "Kitchen accepted",        icon: "✅" },
  { key: "Preparing", label: "Preparing", sub: "Chef is cooking",         icon: "👨‍🍳" },
  { key: "Ready",     label: "Ready",     sub: "Awaiting service",        icon: "🍽️" },
  { key: "Completed", label: "Completed", sub: "Served to table",         icon: "🎉" },
] as const;

type StepKey = typeof STEPS[number]["key"];

const STEP_KEYS = STEPS.map(s => s.key);

function parseItems(itemsStr: string): { name: string; qty: number }[] {
  return itemsStr.split(",").map(part => {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d+)\s*[xX]\s*(.+)$/);
    if (match) return { qty: parseInt(match[1]), name: match[2].trim() };
    return { qty: 1, name: trimmed };
  });
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending:   "bg-gray-500   text-white",
    Confirmed: "bg-blue-600   text-white",
    Accepted:  "bg-indigo-600 text-white",
    Preparing: "bg-orange-500 text-white",
    Ready:     "bg-purple-600 text-white",
    Completed: "bg-green-600  text-white",
    Cancelled: "bg-red-600    text-white",
  };
  return map[status] ?? "bg-gray-400 text-white";
};

const stepFraction = (idx: number) =>
  idx <= 0 ? "0%" :
  idx === 1 ? "20%" :
  idx === 2 ? "40%" :
  idx === 3 ? "60%" :
  idx === 4 ? "80%" : "100%";

export default function TrackingView({
  orders, trackId, setTrackId, role, confirmOrder, markServed, setView,
}: TrackingViewProps) {
  const order       = orders.find(o => o.id === trackId) || orders[0];
  const activeStep  = STEP_KEYS.indexOf(order?.status as StepKey);
  const parsedItems = parseItems(order?.items ?? "");
  const initial     = order?.name?.[0]?.toUpperCase() ?? "?";

  if (!order) return null;

  const isCancelled = order.status === "Cancelled";

  // Status-specific messages
  const statusMsg: Record<string, { bg: string; text: string; msg: string }> = {
    Pending:   { bg: "bg-gray-50 border-gray-200",   text: "text-gray-600",   msg: "⏳ Order placed. Waiter needs to confirm & send to kitchen." },
    Confirmed: { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",   msg: "📤 Order sent to kitchen. Waiting for kitchen to accept." },
    Accepted:  { bg: "bg-indigo-50 border-indigo-200",text: "text-indigo-700",msg: "✅ Kitchen has accepted the order. Ready to start cooking." },
    Preparing: { bg: "bg-orange-50 border-orange-200",text: "text-orange-700",msg: "🍳 Chef is cooking this order. You'll be alerted when it's ready." },
    Ready:     { bg: "bg-purple-50 border-purple-200",text: "text-purple-700",msg: `🔔 Order is ready! Please serve to Table ${order.table}. Waiter has been notified.` },
    Completed: { bg: "bg-green-50 border-green-200", text: "text-green-700",  msg: `🎉 Order served successfully to Table ${order.table}. Done!` },
    Cancelled: { bg: "bg-red-50 border-red-200",     text: "text-red-700",   msg: "❌ This order has been cancelled." },
  };

  const sm = statusMsg[order.status] ?? statusMsg["Pending"];

  // Role-gated buttons
  const canConfirm  = !isCancelled && order.status === "Pending"   && (role === "Waiter" || role === "Admin");
  const canServe    = !isCancelled && order.status === "Ready"     && (role === "Waiter" || role === "Admin");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Tracking</h1>
          <p className="text-xs text-gray-400 mt-0.5">Follow an order through all 6 stages</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm mt-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Order selector tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {orders.map(o => (
          <button
            key={o.id}
            onClick={() => setTrackId(o.id)}
            className={
              "px-3 py-1 rounded-full text-xs font-medium border transition-all " +
              (trackId === o.id
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50")
            }
          >
            {o.id}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Progress stepper */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-1">Order progress</h2>
            <p className="text-xs text-gray-400 mb-6">
              Table {order.table} · {order.time}
            </p>

            {!isCancelled && (
              <div className="relative flex items-start justify-between">
                {/* Background track */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0 mx-6" />
                {/* Fill track */}
                <div
                  className="absolute top-4 left-0 h-0.5 bg-orange-400 z-0 mx-6 transition-all duration-500"
                  style={{ width: stepFraction(activeStep) }}
                />
                {STEPS.map((step, i) => {
                  const done    = i < activeStep;
                  const current = i === activeStep;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                      <div className={
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs shadow " +
                        (done || current ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400")
                      }>
                        {done ? "✓" : <span>{step.icon}</span>}
                      </div>
                      <p className={`text-[10px] font-semibold mt-1.5 text-center ${done || current ? "text-orange-500" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-gray-400 text-center leading-tight mt-0.5 hidden sm:block">
                        {step.sub}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center justify-center py-4">
                <span className="text-red-500 font-bold text-sm">❌ Order Cancelled</span>
              </div>
            )}

            {/* Status banner */}
            <div className={`mt-5 border rounded-xl px-4 py-2.5 ${sm.bg}`}>
              <p className={`text-xs font-medium ${sm.text}`}>{sm.msg}</p>
            </div>
          </div>

          {/* Timeline */}
          {order.history.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 text-sm mb-3">📋 Status Timeline</h2>
              <div className="flex flex-col gap-2">
                {order.history.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-10 flex-shrink-0">{h.at}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(h.status)}`}>
                      {h.status}
                    </span>
                    <span className="text-xs text-gray-500">by</span>
                    <span className="text-xs font-semibold text-gray-700">{h.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 text-sm mb-3">Items ordered</h2>
            <div className="flex flex-col gap-2">
              {parsedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-orange-500">x{item.qty}</span>
                </div>
              ))}
            </div>
            {order.note && (
              <p className="text-xs text-gray-400 mt-3 italic">📝 Note: {order.note}</p>
            )}
          </div>
        </div>

        {/* RIGHT — Order info + action buttons */}
        <div className="lg:w-64 w-full">
          <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-lg">
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">{order.name}</p>
                <p className="text-xs text-gray-400">Table {order.table}</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-2.5 mb-5">
              {[
                { label: "Order ID", val: order.id },
                { label: "Items",    val: `${order.qty} item${order.qty !== 1 ? "s" : ""}` },
                { label: "Placed",   val: order.time },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className="text-xs font-semibold text-white font-mono">{row.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Role-gated action buttons */}
            <div className="flex flex-col gap-2">
              {/* Step 2: Waiter → Confirm & Send */}
              {canConfirm && (
                <button
                  onClick={() => confirmOrder(order.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  📤 Confirm & Send to Kitchen
                </button>
              )}

              {/* Step 6: Waiter → Mark Served */}
              {canServe && (
                <button
                  onClick={() => markServed(order.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  ✅ Mark Served → Completed
                </button>
              )}

              {/* Kitchen info */}
              {(role === "Kitchen Staff") && !isCancelled && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-xs text-gray-400">Kitchen actions are on the</p>
                  <p className="text-xs font-bold text-orange-400">Kitchen Board →</p>
                </div>
              )}

              <button
                onClick={() => setView("All Orders")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                View all orders →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
