"use client";

import StatusBadge from "../common/StatusBadge";

interface OrderCardProps {
  order: {
    id: string;
    orderNumber?: string;
    customerName?: string;
    items?: string;
    orderType?: string;
    total: number;
    status: string;
    createdAt?: string;
  };
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-extrabold text-gray-900 text-sm">
            #{order.orderNumber || order.id}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">{order.createdAt || "Just now"}</p>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      <div className="my-2">
        <p className="font-semibold text-gray-800 text-sm">{order.customerName || "Customer"}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.items || "Order items"}</p>
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-semibold">
        <span className="text-gray-500">{order.orderType || "Dine In"}</span>
        <span className="text-orange-600 font-bold text-sm">₹{order.total}</span>
      </div>
    </div>
  );
}
