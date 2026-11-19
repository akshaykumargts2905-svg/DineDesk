"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KitchenColumn from "@/components/kitchen/KitchenColumn";
import { KitchenItem } from "@/components/kitchen/KitchenOrderCard";
import { kitchenService, MOCK_KITCHEN_ORDERS } from "@/services/api";

export default function KitchenPage() {
  const [pendingOrders, setPendingOrders] = useState<KitchenItem[]>(
    MOCK_KITCHEN_ORDERS.pending
  );
  const [preparingOrders, setPreparingOrders] = useState<KitchenItem[]>(
    MOCK_KITCHEN_ORDERS.preparing
  );
  const [readyOrders, setReadyOrders] = useState<KitchenItem[]>(
    MOCK_KITCHEN_ORDERS.ready
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Load kitchen orders
  useEffect(() => {
    async function loadKitchen() {
      try {
        const data = await kitchenService.getOrders();
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (data.pending) setPendingOrders(data.pending);
          if (data.preparing) setPreparingOrders(data.preparing);
          if (data.ready) setReadyOrders(data.ready);
        } else if (Array.isArray(data)) {
          // Format backend array into 3 columns
          const pending = data
            .filter((o: any) => o.status === "PLACED" || o.status === "ACCEPTED")
            .map(formatBackendOrder);
          const preparing = data
            .filter((o: any) => o.status === "PREPARING")
            .map(formatBackendOrder);
          const ready = data
            .filter((o: any) => o.status === "READY")
            .map(formatBackendOrder);

          if (pending.length > 0 || preparing.length > 0 || ready.length > 0) {
            setPendingOrders(pending);
            setPreparingOrders(preparing);
            setReadyOrders(ready);
          }
        }
      } catch (err) {
        console.log("Using local kitchen mock state", err);
      }
    }
    loadKitchen();
  }, []);

  const formatBackendOrder = (o: any): KitchenItem => ({
    id: o.id,
    orderNumber: o.orderNumber,
    itemsText:
      o.items?.map((i: any) => i.itemName).join(", ") || "Menu Items",
    qty: o.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 1,
    time: "Just now",
    specialInstructions: o.notes || undefined,
    imageUrl:
      o.items?.[0]?.menuItem?.imageUrl ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
  });

  // Action: Start Preparing (Pending -> Preparing)
  const handleStartPrep = async (orderId: string) => {
    setLoadingId(orderId);
    try {
      await kitchenService.startPrep(orderId);
    } catch {}

    const orderToMove = pendingOrders.find((o) => o.id === orderId);
    if (orderToMove) {
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setPreparingOrders((prev) => [
        { ...orderToMove, time: "Just now" },
        ...prev,
      ]);
    }
    setLoadingId(null);
  };

  // Action: Mark Ready (Preparing -> Ready)
  const handleMarkReady = async (orderId: string) => {
    setLoadingId(orderId);
    try {
      await kitchenService.markReady(orderId);
    } catch {}

    const orderToMove = preparingOrders.find((o) => o.id === orderId);
    if (orderToMove) {
      setPreparingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setReadyOrders((prev) => [
        { ...orderToMove, time: "Just now" },
        ...prev,
      ]);
    }
    setLoadingId(null);
  };

  // Action: Serve Order (Ready -> Served/Removed from Kitchen)
  const handleServeOrder = async (orderId: string) => {
    setLoadingId(orderId);
    try {
      await kitchenService.serveOrder(orderId);
    } catch {}

    setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
    setLoadingId(null);
  };

  return (
    <DashboardLayout
      title="Kitchen"
      subtitle="Manage kitchen orders and update status"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Pending Orders */}
        <KitchenColumn
          title="Pending Orders"
          count={pendingOrders.length}
          theme="orange"
          orders={pendingOrders}
          actionLabel="Start Preparing"
          actionColor="orange"
          onAction={handleStartPrep}
          loadingId={loadingId}
        />

        {/* Column 2: Preparing Orders */}
        <KitchenColumn
          title="Preparing Orders"
          count={preparingOrders.length}
          theme="navy"
          orders={preparingOrders}
          actionLabel="Mark Ready"
          actionColor="blue"
          onAction={handleMarkReady}
          loadingId={loadingId}
        />

        {/* Column 3: Ready Orders */}
        <KitchenColumn
          title="Ready Orders"
          count={readyOrders.length}
          theme="green"
          orders={readyOrders}
          actionLabel="Serve Order"
          actionColor="green"
          onAction={handleServeOrder}
          loadingId={loadingId}
        />
      </div>
    </DashboardLayout>
  );
}
