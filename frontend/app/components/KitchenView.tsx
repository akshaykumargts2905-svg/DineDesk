"use client";
import type { Order } from "../types";

interface KitchenViewProps {
  orders: Order[];
  acceptOrder:  (id: string) => void;
  startCooking: (id: string) => void;
  markReady:    (id: string) => void;
}

// 4 columns the kitchen cares about
const COLUMNS = [
  {
    t:         "Incoming",
    status:    "Confirmed",
    btn:       "✅ Accept Order",
    action:    "accept" as const,
    icon:      "📥",
    dot:       "bg-blue-500",
    hBg:       "bg-blue-50 border-blue-200",
    hText:     "text-blue-700",
    cBg:       "bg-blue-100 text-blue-700",
    bClass:    "bg-blue-600 hover:bg-blue-700",
    borderL:   "border-blue-300",
    empty:     "No new orders — kitchen is clear!",
  },
  {
    t:         "Accepted",
    status:    "Accepted",
    btn:       "👨‍🍳 Start Cooking",
    action:    "start" as const,
    icon:      "🤝",
    dot:       "bg-indigo-500",
    hBg:       "bg-indigo-50 border-indigo-200",
    hText:     "text-indigo-700",
    cBg:       "bg-indigo-100 text-indigo-700",
    bClass:    "bg-indigo-600 hover:bg-indigo-700",
    borderL:   "border-indigo-300",
    empty:     "Nothing accepted yet",
  },
  {
    t:         "Cooking",
    status:    "Preparing",
    btn:       "🍽️ Mark Ready",
    action:    "ready" as const,
    icon:      "🔥",
    dot:       "bg-orange-500",
    hBg:       "bg-orange-50 border-orange-200",
    hText:     "text-orange-700",
    cBg:       "bg-orange-100 text-orange-700",
    bClass:    "bg-orange-500 hover:bg-orange-600",
    borderL:   "border-orange-300",
    empty:     "Nothing cooking",
  },
  {
    t:         "Ready",
    status:    "Ready",
    btn:       "",
    action:    "none" as const,
    icon:      "✅",
    dot:       "bg-green-500",
    hBg:       "bg-green-50 border-green-200",
    hText:     "text-green-700",
    cBg:       "bg-green-100 text-green-700",
    bClass:    "",
    borderL:   "border-green-300",
    empty:     "Nothing ready yet",
  },
] as const;

type Action = typeof COLUMNS[number]["action"];

function parseItems(itemsStr: string): { name: string; qty: number }[] {
  return itemsStr.split(",").map(part => {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d+)\s*[xX]\s*(.+)$/);
    if (match) return { qty: parseInt(match[1]), name: match[2].trim() };
    return { qty: 1, name: trimmed };
  });
}

function OrderCard({
  order, btn, bClass, borderL, action,
  acceptOrder, startCooking, markReady,
}: {
  order: Order;
  btn: string; bClass: string; borderL: string; action: Action;
  acceptOrder: (id: string) => void;
  startCooking: (id: string) => void;
  markReady: (id: string) => void;
}) {
  const items = parseItems(order.items);

  const handleClick = () => {
    if (action === "accept") acceptOrder(order.id);
    if (action === "start")  startCooking(order.id);
    if (action === "ready")  markReady(order.id);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderL} p-4 flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            Table {order.table}
          </span>
          <span className="text-xs text-gray-400 font-mono">{order.id}</span>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {order.time}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
          {order.name[0]?.toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-gray-800">{order.name}</span>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{item.name}</span>
            <span className="text-xs font-bold text-orange-500">x{item.qty}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.note ? (
        <p className="text-[11px] text-gray-400 italic bg-yellow-50 border border-yellow-100 rounded-lg px-2.5 py-1.5">
          📝 {order.note}
        </p>
      ) : null}

      {/* Action */}
      {action !== "none" ? (
        <button
          onClick={handleClick}
          className={`${bClass} text-white text-xs font-bold py-2.5 rounded-xl transition-colors w-full`}
        >
          {btn}
        </button>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-1.5 bg-green-50 border border-green-200 rounded-xl py-2">
            <span className="text-xs font-bold text-green-700">🔔 Waiter notified — awaiting pickup</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-purple-50 border border-purple-200 rounded-xl py-1.5">
            <span className="text-[10px] font-semibold text-purple-600">📱 Push sent to Waiter David</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KitchenView({ orders, acceptOrder, startCooking, markReady }: KitchenViewProps) {
  const totalActive = orders.filter(o =>
    ["Confirmed", "Accepted", "Preparing", "Ready"].includes(o.status)
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Board</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Live kitchen display · {totalActive} active order{totalActive !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Kitchen live
        </span>
      </div>

      {/* Workflow legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: "1 → Confirm & Send",   color: "bg-gray-100   text-gray-600"   },
          { label: "2 → Kitchen Accepts",  color: "bg-blue-100   text-blue-700"   },
          { label: "3 → Start Cooking",    color: "bg-indigo-100 text-indigo-700" },
          { label: "4 → Mark Ready",       color: "bg-orange-100 text-orange-700" },
          { label: "5 → Waiter Serves",    color: "bg-green-100  text-green-700"  },
        ].map(s => (
          <span key={s.label} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
            {s.label}
          </span>
        ))}
      </div>

      {/* 4-column kanban */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map(col => {
          const list = orders.filter(o => o.status === col.status);
          return (
            <div key={col.t} className="flex-1 min-w-[240px] flex flex-col gap-3">
              {/* Column header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.hBg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className={`text-sm font-bold ${col.hText}`}>
                    {col.icon} {col.t}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.cBg}`}>
                  {list.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {list.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl opacity-30">🍽️</span>
                    <p className="text-xs text-gray-400">{col.empty}</p>
                  </div>
                ) : (
                  list.map(o => (
                    <OrderCard
                      key={o.id} order={o}
                      btn={col.btn} bClass={col.bClass}
                      borderL={col.borderL} action={col.action}
                      acceptOrder={acceptOrder}
                      startCooking={startCooking}
                      markReady={markReady}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
