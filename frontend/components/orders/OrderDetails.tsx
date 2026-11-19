"use client";

import StatusBadge from "../common/StatusBadge";

interface OrderItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderDetailsProps {
  order: {
    id: string;
    orderNumber?: string;
    customerName?: string;
    customerPhone?: string;
    orderType: string;
    createdAt?: string;
    status: string;
    total: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    notes?: string;
    table?: string;
    itemList?: OrderItem[];
    items?: string;
  };
  onClose: () => void;
  onStatusChange?: (newStatus: string) => void;
}

export default function OrderDetails({
  order,
  onClose,
  onStatusChange,
}: OrderDetailsProps) {
  const items = order.itemList || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-gray-900">
                Order #{order.orderNumber || order.id}
              </h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Placed on {order.createdAt || "Recently"} • {order.orderType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Customer & Table details */}
          <div className="grid grid-cols-2 gap-4 bg-[#F8F9FC] p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium">Customer</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                {order.customerName || "Walk-in Guest"}
              </p>
              {order.customerPhone && (
                <p className="text-xs text-gray-500">{order.customerPhone}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Order Type / Table</p>
              <p className="font-bold text-gray-800 text-sm mt-0.5">
                {order.orderType} {order.table ? `• Table ${order.table}` : ""}
              </p>
              {order.notes && (
                <p className="text-xs text-orange-600 mt-1 italic">
                  Note: {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">Order Items</h4>
            {items.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex justify-between items-center text-sm"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        {item.itemName}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        x {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{item.lineTotal || item.unitPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                {order.items || "Items information"}
              </p>
            )}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">₹{order.subtotal}</span>
              </div>
            )}
            {order.tax !== undefined && (
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span className="font-medium text-gray-800">₹{order.tax}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-dashed border-gray-200">
              <span>Total Amount</span>
              <span className="text-orange-600 text-lg">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition"
          >
            Close
          </button>
          {onStatusChange && (
            <button
              onClick={() => onStatusChange("COMPLETED")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition shadow-sm"
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
