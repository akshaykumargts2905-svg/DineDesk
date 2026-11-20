"use client";

export interface KitchenItem {
  id: string;
  orderNumber: string;
  itemsText: string;
  itemsList?: { name: string; qty: number }[];
  qty: number;
  time: string;
  status: string;
  specialInstructions?: string;
  imageUrl?: string;
}

interface KitchenOrderCardProps {
  order: KitchenItem;
  actionLabel?: string;
  actionColor: "orange" | "blue" | "green";
  onAction?: (id: string) => void;
  isLoading?: boolean;
}

export default function KitchenOrderCard({
  order,
  actionLabel,
  actionColor,
  onAction,
  isLoading = false,
}: KitchenOrderCardProps) {
  const fallbackImg =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300";

  const buttonColorClasses = {
    orange: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20",
    blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
  }[actionColor];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex gap-3.5">
        {/* Food Thumbnail Image */}
        <div className="w-18 h-18 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <img
            src={order.imageUrl || fallbackImg}
            alt={order.orderNumber}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-gray-900 text-base">
            #{order.orderNumber}
          </h4>
          <p className="text-gray-700 text-sm font-semibold truncate mt-0.5">
            {order.itemsText}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
              Qty: {order.qty}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              ⏱ {order.time}
            </span>
          </div>

          {order.specialInstructions && (
            <p className="text-[11px] text-orange-600 bg-orange-50/80 px-2 py-1 rounded-md mt-2 font-medium line-clamp-1">
              Note: {order.specialInstructions}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && <button
        onClick={() => onAction(order.id)}
        disabled={isLoading}
        className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${buttonColorClasses}`}
      >
        {isLoading ? "Updating..." : actionLabel}
      </button>}
    </div>
  );
}
