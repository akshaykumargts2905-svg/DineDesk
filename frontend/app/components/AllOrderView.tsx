import type { Order, Role } from "../types";

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
}

interface AllOrderViewProps {
  orders: Order[];
  setTrackId: (id: string) => void;
  setView: (view: string) => void;
  role: Role | string;
  currentUser?: CurrentUser;
  confirmOrder: (id: string) => void;
  markServed:   (id: string) => void;
  cancelOrder:  (id: string) => void;
}

const STATUS_STYLE: Record<string, { border: string; badge: string }> = {
  Pending:   { border: "border-gray-400",   badge: "bg-gray-100 text-gray-700"    },
  Confirmed: { border: "border-blue-500",   badge: "bg-blue-100 text-blue-700"    },
  Accepted:  { border: "border-indigo-500", badge: "bg-indigo-100 text-indigo-700"},
  Preparing: { border: "border-orange-500", badge: "bg-orange-100 text-orange-600"},
  Ready:     { border: "border-purple-500", badge: "bg-purple-100 text-purple-700"},
  Completed: { border: "border-green-500",  badge: "bg-green-100 text-green-700"  },
  Cancelled: { border: "border-red-400",    badge: "bg-red-100 text-red-600"      },
};

const PILL_META = [
  { status: "Pending",   emoji: "🛒", bg: "bg-gray-100   text-gray-700"    },
  { status: "Confirmed", emoji: "📤", bg: "bg-blue-100   text-blue-700"    },
  { status: "Accepted",  emoji: "🤝", bg: "bg-indigo-100 text-indigo-700"  },
  { status: "Preparing", emoji: "🍳", bg: "bg-orange-100 text-orange-700"  },
  { status: "Ready",     emoji: "🍽️", bg: "bg-purple-100 text-purple-700"  },
  { status: "Completed", emoji: "✅", bg: "bg-green-100  text-green-700"   },
];

const DEFAULT_CURRENT_USER: CurrentUser = {
  id: "cust-03",
  name: "Priya Singh",
  role: "CUSTOMER",
};

export default function AllOrderView({
  orders, setTrackId, setView, role, currentUser = DEFAULT_CURRENT_USER, confirmOrder, markServed, cancelOrder,
}: AllOrderViewProps) {
  const roleUpper = role ? role.toUpperCase() : "";
  const userRoleUpper = currentUser?.role ? currentUser.role.toUpperCase() : "";

  const isStaff = roleUpper === "WAITER" || roleUpper === "ADMIN" || userRoleUpper === "WAITER" || userRoleUpper === "ADMIN";
  const isCustomer = !isStaff && (userRoleUpper === "CUSTOMER" || roleUpper === "CUSTOMER");

  const displayedOrders = isCustomer
    ? orders.filter(o => o.customerId === currentUser?.id)
    : orders;

  const heading = isCustomer ? "My Orders" : "All Orders";

  const counts = PILL_META.reduce<Record<string, number>>((acc, { status }) => {
    acc[status] = displayedOrders.filter(o => o.status === status).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{heading}</h1>
          <p className="text-gray-500 text-sm">{displayedOrders.length} orders total</p>
        </div>
      </div>

      {/* Quick stat pills — 6 stages */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PILL_META.map(({ status, emoji, bg }) => (
          <span key={status} className={`text-xs font-bold px-3 py-1 rounded-full ${bg}`}>
            {emoji} {status}: {counts[status] ?? 0}
          </span>
        ))}
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedOrders.map(o => {
          const s = STATUS_STYLE[o.status] ?? STATUS_STYLE["Pending"];

          // Role-based action buttons on the card
          const canConfirm = o.status === "Pending" && (role === "Waiter" || role === "Admin");
          const canServe   = o.status === "Ready"   && (role === "Waiter" || role === "Admin");
          const canCancel  = !["Completed", "Cancelled"].includes(o.status)
                              && (role === "Admin" || role === "Waiter");

          return (
            <div key={o.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm ${s.border}`}>
              {/* Top */}
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-gray-400">{o.id}</span>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${s.badge}`}>
                  {o.status}
                </span>
              </div>

              {/* Customer + table */}
              <div className="mt-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {o.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{o.name}</p>
                  <p className="text-xs text-gray-400">Table {o.table}</p>
                </div>
              </div>

              {/* Items */}
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{o.items}</p>

              {/* Note */}
              {o.note && (
                <p className="text-[11px] text-gray-400 italic mt-1">📝 {o.note}</p>
              )}

              {/* Footer */}
              <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t gap-2">
                <p className="text-gray-400 text-xs">🕒 {o.time}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {/* Step 2 — Waiter confirms */}
                  {canConfirm && (
                    <button
                      onClick={() => confirmOrder(o.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors"
                    >
                      📤 Confirm
                    </button>
                  )}

                  {/* Step 6 — Waiter marks served */}
                  {canServe && (
                    <button
                      onClick={() => markServed(o.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors"
                    >
                      ✅ Served
                    </button>
                  )}

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      onClick={() => {
                        if (confirm(`Cancel order ${o.id}?`)) cancelOrder(o.id);
                      }}
                      className="border border-red-300 text-red-500 px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  )}

                  {/* Track */}
                  <button
                    onClick={() => { setTrackId(o.id); setView("Tracking"); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors"
                  >
                    Track →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
