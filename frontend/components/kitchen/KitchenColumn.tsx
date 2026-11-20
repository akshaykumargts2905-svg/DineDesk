"use client";

import KitchenOrderCard, { KitchenItem } from "./KitchenOrderCard";

interface KitchenColumnProps {
  title: string;
  count: number;
  theme: "orange" | "navy" | "green";
  orders: KitchenItem[];
  actionLabel?: string;
  actionColor: "orange" | "blue" | "green";
  onAction?: (orderId: string) => void;
  loadingId?: string | null;
}

export default function KitchenColumn({
  title,
  count,
  theme,
  orders,
  actionLabel,
  actionColor,
  onAction,
  loadingId,
}: KitchenColumnProps) {
  const themeHeaderStyles = {
    orange: "bg-orange-500 text-white shadow-orange-500/20",
    navy: "bg-[#1E293B] text-white shadow-slate-900/20",
    green: "bg-emerald-600 text-white shadow-emerald-600/20",
  }[theme];

  return (
    <div className="flex-1 flex flex-col min-w-[280px]">
      {/* Header Pill */}
      <div
        className={`px-4 py-3 rounded-2xl font-bold flex items-center justify-between shadow-sm mb-4 ${themeHeaderStyles}`}
      >
        <span className="text-sm md:text-base tracking-wide flex items-center gap-2">
          {theme === "orange" ? "🥘" : theme === "navy" ? "👨‍🍳" : "🛎️"}
          {title}
        </span>
        <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs font-extrabold text-white">
          {count}
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-3.5 flex-1">
        {orders.length === 0 ? (
          <div className="bg-white/60 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            <span className="text-3xl block mb-2">✨</span>
            <p className="text-xs font-semibold">No orders in this stage</p>
          </div>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              actionLabel={actionLabel}
              actionColor={actionColor}
              onAction={onAction}
              isLoading={loadingId === order.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
