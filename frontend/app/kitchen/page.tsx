"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KitchenColumn from "@/components/kitchen/KitchenColumn";
import { KitchenItem } from "@/components/kitchen/KitchenOrderCard";
import { kitchenService, Order, ApiError } from "@/services/api";
import { getNewKitchenOrderIds, playNotificationSound, speakNewOrderReceived } from "@/services/notificationSound";

const formatBackendOrder = (order: Order): KitchenItem => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  itemsText: order.items.map((item) => `${item.quantity} × ${item.itemName}`).join(", ") || "Menu items",
  itemsList: order.items.map((item) => ({ name: item.itemName, qty: item.quantity })),
  qty: order.items.reduce((sum, item) => sum + item.quantity, 0),
  time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  specialInstructions: order.items.map((item) => item.specialInstructions).filter(Boolean).join(" · ") || order.notes || undefined,
});

export default function KitchenPage() {
  const [pendingOrders, setPendingOrders] = useState<KitchenItem[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<KitchenItem[]>([]);
  const [readyOrders, setReadyOrders] = useState<KitchenItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const isLoadingOrders = useRef(false);

  const loadKitchen = useCallback(async () => {
    if (isLoadingOrders.current) return;
    isLoadingOrders.current = true;

    try {
      const orders = await kitchenService.getOrders();
      const newOrderIds = getNewKitchenOrderIds(orders.map((order) => order.id));
      if (newOrderIds.length > 0) {
        playNotificationSound();
        speakNewOrderReceived();
      }
      setPendingOrders(orders.filter((order) => order.status === "PLACED" || order.status === "ACCEPTED").map(formatBackendOrder));
      setPreparingOrders(orders.filter((order) => order.status === "PREPARING").map(formatBackendOrder));
      setReadyOrders(orders.filter((order) => order.status === "READY").map(formatBackendOrder));
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not load kitchen orders.");
    } finally {
      isLoadingOrders.current = false;
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadKitchen(), 0);
    const interval = window.setInterval(loadKitchen, 30000);
    return () => { window.clearTimeout(initialLoad); window.clearInterval(interval); };
  }, [loadKitchen]);

  const handleStartPrep = async (orderId: string) => {
    setLoadingId(orderId);
    setErrorMessage("");
    try {
      const order = pendingOrders.find((item) => item.id === orderId);
      if (order?.status === "PLACED") await kitchenService.accept(orderId);
      await kitchenService.startPrep(orderId);
      await loadKitchen();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not start preparation.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setLoadingId(orderId);
    setErrorMessage("");
    try {
      await kitchenService.markReady(orderId);
      await loadKitchen();
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not mark order ready.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DashboardLayout title="Kitchen" subtitle="Manage kitchen orders and update status">
      {errorMessage && <p role="alert" className="mb-4 text-sm text-red-600">{errorMessage}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <KitchenColumn title="Pending Orders" count={pendingOrders.length} theme="orange" orders={pendingOrders} actionLabel="Start Preparing" actionColor="orange" onAction={handleStartPrep} loadingId={loadingId} />
        <KitchenColumn title="Preparing Orders" count={preparingOrders.length} theme="navy" orders={preparingOrders} actionLabel="Mark Ready" actionColor="blue" onAction={handleMarkReady} loadingId={loadingId} />
        <KitchenColumn title="Ready Orders" count={readyOrders.length} theme="green" orders={readyOrders} actionColor="green" />
      </div>
    </DashboardLayout>
  );
}
