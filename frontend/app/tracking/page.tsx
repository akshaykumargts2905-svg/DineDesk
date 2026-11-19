"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { orderService, MOCK_ORDERS } from "@/services/api";

export default function TrackingPage() {
  const [searchId, setSearchId] = useState("ORD101");
  const [activeOrder, setActiveOrder] = useState<any>(MOCK_ORDERS[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTrack = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setErrorMessage("");

    try {
      const cleanId = searchId.trim().replace(/^#/, "");
      const found = await orderService.getById(cleanId);
      if (found) {
        setActiveOrder(found);
      } else {
        const localMatch = MOCK_ORDERS.find(
          (o) =>
            o.id.toLowerCase() === cleanId.toLowerCase() ||
            o.orderNumber.toLowerCase() === cleanId.toLowerCase()
        );
        if (localMatch) {
          setActiveOrder(localMatch);
        } else {
          setErrorMessage(`No order found matching "${searchId}". Showing recent order.`);
        }
      }
    } catch {
      const localMatch = MOCK_ORDERS.find(
        (o) =>
          o.id.toLowerCase() === searchId.trim().replace(/^#/, "").toLowerCase()
      );
      if (localMatch) setActiveOrder(localMatch);
    } finally {
      setIsSearching(false);
    }
  };

  const isOrderReady =
    (activeOrder?.status || "").toUpperCase() === "READY" ||
    (activeOrder?.status || "").toUpperCase() === "SERVED" ||
    (activeOrder?.status || "").toUpperCase() === "COMPLETED";

  return (
    <DashboardLayout
      title="Tracking"
      subtitle="Track your order in real-time"
    >
      <div className="space-y-6">
        {/* Search Bar matching Screenshot panel 5 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-base">
              🔍
            </span>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Search by Order ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm"
            />
          </div>

          <button
            onClick={handleTrack}
            disabled={isSearching}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-2.5 rounded-xl transition shadow-sm cursor-pointer text-sm whitespace-nowrap"
          >
            {isSearching ? "Searching..." : "Track Order"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
        )}

        {/* 4 Cards Grid Layout matching Screenshot panel 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-stretch">
          {/* CARD 1: Order Details */}
          <div className="xl:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                <h3 className="font-bold text-gray-900 text-base">
                  Order Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-y-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Order ID</p>
                  <p className="font-extrabold text-gray-900 text-base mt-0.5">
                    #{activeOrder.orderNumber || activeOrder.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium">Customer</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">
                    {activeOrder.customerName || "Rahul Sharma"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium">Order Type</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">
                    {activeOrder.orderType || "Dine In"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                  <p className="font-extrabold text-orange-600 text-base mt-0.5">
                    ₹{activeOrder.total || 540}
                  </p>
                </div>
              </div>
            </div>

            {activeOrder.table && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Table Assigned</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                  {activeOrder.table}
                </span>
              </div>
            )}
          </div>

          {/* CARD 2: Order Progress (Horizontal Stepper) */}
          <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
              <h3 className="font-bold text-gray-900 text-base">
                Order Progress
              </h3>
            </div>

            <div className="py-2 flex-1 flex items-center">
              <OrderTimeline
                currentStatus={activeOrder.status}
                timestamps={{
                  placed: "2:15 PM",
                  preparing: "2:17 PM",
                  ready: "2:20 PM",
                  served: activeOrder.status === "Completed" ? "2:25 PM" : "Pending",
                }}
              />
            </div>

            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              Live kitchen tracking updated automatically
            </div>
          </div>

          {/* CARD 3: Order Timeline (Vertical List) */}
          <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                <h3 className="font-bold text-gray-900 text-base">
                  Order Timeline
                </h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-gray-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                  <div>
                    <p className="text-gray-900 font-bold">Order Placed</p>
                    <p className="text-gray-400 font-normal text-[11px]">2:15 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                  <div>
                    <p className="text-gray-900 font-bold">In Preparation</p>
                    <p className="text-gray-400 font-normal text-[11px]">2:17 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      isOrderReady ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  ></span>
                  <div>
                    <p className="text-gray-900 font-bold">Ready for Pickup</p>
                    <p className="text-gray-400 font-normal text-[11px]">
                      {isOrderReady ? "2:20 PM" : "Estimated 2:25 PM"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 pt-3 border-t border-gray-100">
              Average Prep: 15 mins
            </div>
          </div>

          {/* CARD 4: Food Banner Card matching Screenshot panel 5 */}
          <div
            className="xl:col-span-3 rounded-2xl p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden min-h-[220px]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(17,17,23,0.92) 0%, rgba(17,17,23,0.7) 100%), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex justify-end">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400 text-2xl font-bold">
                ✓
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {isOrderReady ? "Your order is Ready!" : "In Preparation..."}
              </h3>
              <p className="text-gray-300 text-xs md:text-sm mt-1">
                {isOrderReady
                  ? "Enjoy your meal!"
                  : "Chef is crafting your delicious meal!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
