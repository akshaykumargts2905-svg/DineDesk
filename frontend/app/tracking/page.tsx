"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { ApiError, Order, trackingService } from "@/services/api";

export default function TrackingPage() {
  const [searchId, setSearchId] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
    const queryOrder = new URLSearchParams(window.location.search).get("order");
    if (queryOrder) {
      setSearchId(queryOrder);
      void trackingService.getById(queryOrder).then(setActiveOrder).catch((err) => setErrorMessage(err instanceof ApiError ? err.message : "Could not load order tracking."));
      return;
    }
    void trackingService.getOrders().then((orders) => {
      if (orders[0]) {
        setActiveOrder(orders[0]);
        setSearchId(orders[0].orderNumber);
      } else setErrorMessage("There are no active orders to track.");
    }).catch((err) => setErrorMessage(err instanceof ApiError ? err.message : "Could not load active orders."));
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  useEffect(() => {
    if (!activeOrder) return;
    const interval = window.setInterval(() => {
      void trackingService.getById(activeOrder.orderNumber).then(setActiveOrder).catch(() => {});
    }, 15000);
    return () => window.clearInterval(interval);
  }, [activeOrder]);

  const handleTrack = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setActiveOrder(null);
    setErrorMessage("");

    try {
      const cleanId = searchId.trim().replace(/^#/, "");
      const found = await trackingService.getById(cleanId);
      setActiveOrder(found);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not find that order.");
    } finally {
      setIsSearching(false);
    }
  };

  const isOrderReady = ["READY", "SERVED", "COMPLETED"].includes(activeOrder?.status || "");
  const historyTime = (status: string) => {
    const entry = activeOrder?.statusHistory?.find((item) => item.toStatus === status);
    return entry ? new Date(entry.changedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Pending";
  };
  const updateStatus = async (action: "served" | "complete") => {
    if (!activeOrder) return;
    setActionBusy(true);
    setErrorMessage("");
    try {
      const updated = action === "served"
        ? await trackingService.markServed(activeOrder.id)
        : await trackingService.complete(activeOrder.id, paymentMethod);
      setActiveOrder(updated);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not update order status.");
    } finally {
      setActionBusy(false);
    }
  };

  if (!activeOrder) return (
    <DashboardLayout title="Tracking" subtitle="Track your order in real-time">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {errorMessage ? <p role="alert" className="text-sm text-red-600">{errorMessage}</p> : <p className="text-sm text-gray-500">Loading active orders…</p>}
      </div>
    </DashboardLayout>
  );

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
                    {activeOrder.customerName || "Walk-in Guest"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium">Order Type</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">
                    {activeOrder.orderType.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                  <p className="font-extrabold text-orange-600 text-base mt-0.5">
                    ₹{activeOrder.total}
                  </p>
                </div>
              </div>
            </div>

            {activeOrder.table && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Table Assigned</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                  T{activeOrder.table?.tableNumber}
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
                  placed: historyTime("PLACED"),
                  preparing: historyTime("PREPARING"),
                  ready: historyTime("READY"),
                  served: historyTime("SERVED"),
                }}
              />
            </div>

            {(activeOrder.status === "READY" || activeOrder.status === "SERVED") && (
              <div className="flex flex-wrap gap-2 pb-3">
                {activeOrder.status === "READY" && <button disabled={actionBusy} onClick={() => void updateStatus("served")} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold py-2.5 rounded-xl">{actionBusy ? "Saving…" : "Mark Served"}</button>}
                {activeOrder.status === "SERVED" && <>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-2 text-xs">
                    <option value="CASH">Cash</option><option value="CARD">Card</option><option value="UPI">UPI</option><option value="OTHER">Other</option>
                  </select>
                  <button disabled={actionBusy} onClick={() => void updateStatus("complete")} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold py-2.5 rounded-xl">{actionBusy ? "Saving…" : "Complete & Pay"}</button>
                </>}
              </div>
            )}
            {errorMessage && <p role="alert" className="text-xs text-red-600 pb-2">{errorMessage}</p>}

            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              Refreshes automatically every 15 seconds
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
                {activeOrder.statusHistory?.length ? activeOrder.statusHistory.map((entry) => (
                  <div key={`${entry.toStatus}-${entry.changedAt}`} className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                    <div>
                      <p className="text-gray-900 font-bold">{entry.toStatus.replaceAll("_", " ")}</p>
                      <p className="text-gray-400 font-normal text-[11px]">{new Date(entry.changedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )) : <p className="text-gray-400">No status history available.</p>}
              </div>
            </div>

            <div className="text-[11px] text-gray-400 pt-3 border-t border-gray-100">
              Status history from order updates
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
