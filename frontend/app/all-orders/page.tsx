"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import SearchBar from "@/components/common/SearchBar";
import FilterDropdown from "@/components/common/FilterDropdown";
import DataTable from "@/components/common/DataTable";
import OrderDetails from "@/components/orders/OrderDetails";
import { orderService, Order, ApiError } from "@/services/api";

const label = (value = "") => value.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
type OrderDetailsModel = Omit<Order, "table" | "orderType"> & { table?: string; orderType: string };

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsModel | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch orders from backend
  const fetchOrders = useCallback(async (requestedPage = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(requestedPage), limit: "20" };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.orderType = typeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const response = await orderService.list(params);
      setOrders(response.data || []);
      setCurrentPage(response.pagination?.page || requestedPage);
      setTotalOrders(response.pagination?.total || 0);
      setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchOrders(1), 300);
    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      (order.orderNumber || order.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      order.status === statusFilter;

    const matchesType =
      typeFilter === "ALL" ||
      order.orderType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle Edit Save
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    try {
      const updated = await orderService.update(editingOrder.id, {
        customerName: editingOrder.customerName,
        customerPhone: editingOrder.customerPhone,
      });
      const result = updated.status === editingOrder.status
        ? updated
        : await orderService.updateStatus(updated.id, editingOrder.status);
      setOrders((prev) => prev.map((o) => o.id === result.id ? result : o));
      setEditingOrder(null);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not save order changes.");
    }
  };

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      const updated = await orderService.cancel(cancellingOrder.id, cancelReason || "Customer request");
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
      setCancellingOrder(null);
      setCancelReason("");
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not cancel the order.");
    }
  };

  const columns = [
    {
      header: "Order ID",
      render: (row: Order) => (
        <span className="font-bold text-gray-900">
          #{row.orderNumber || row.id}
        </span>
      ),
    },
    {
      header: "Customer",
      render: (row: Order) => (
        <span className="font-semibold text-gray-800">
          {row.customerName || "Walk-in Guest"}
        </span>
      ),
    },
    {
      header: "Items",
      render: (row: Order) => (
        <span className="text-gray-600 font-medium">
          {row.items.length} {row.items.length === 1 ? "Item" : "Items"}
        </span>
      ),
    },
    {
      header: "Type",
      render: (row: Order) => (
        <span className="text-gray-600 font-medium">{label(row.orderType)}</span>
      ),
    },
    {
      header: "Date & Time",
      render: (row: Order) => (
        <span className="text-gray-500 text-xs md:text-sm">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Total",
      render: (row: Order) => (
        <span className="font-extrabold text-gray-900">₹{row.total}</span>
      ),
    },
    {
      header: "Status",
      render: (row: Order) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      render: (row: Order) => (
        <div className="flex items-center gap-2">
          {/* View Details */}
          <button
            onClick={() => setSelectedOrder({ ...row, table: row.table ? `T${row.table.tableNumber}` : undefined, orderType: label(row.orderType) })}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 flex items-center justify-center transition"
            title="View Order Details"
          >
            👁
          </button>

          {/* Edit */}
          <button
            onClick={() => setEditingOrder({ ...row })}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 flex items-center justify-center transition"
            title="Edit Order"
          >
            ✎
          </button>

          {/* Cancel */}
          <button
            onClick={() => setCancellingOrder(row)}
            disabled={row.status?.toLowerCase() === "completed" || row.status?.toLowerCase() === "cancelled"}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            title="Cancel Order"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="All Orders"
      subtitle="View and manage all restaurant orders"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-6">
        {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
        {/* Filters Top Bar matching Screenshot panel 3 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Order ID or Customer..."
          />

          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "ALL" },
              { label: "Placed", value: "PLACED" },
              { label: "Accepted", value: "ACCEPTED" },
              { label: "Preparing", value: "PREPARING" },
              { label: "Ready", value: "READY" },
              { label: "Served", value: "SERVED" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Cancelled", value: "CANCELLED" },
            ]}
            className="w-full sm:w-44"
          />

          <FilterDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All Type", value: "ALL" },
              { label: "Dine In", value: "DINE_IN" },
              { label: "Takeaway", value: "TAKEAWAY" },
              { label: "Delivery", value: "DELIVERY" },
            ]}
            className="w-full sm:w-40"
          />

          <button
            onClick={() => void fetchOrders(1)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer text-sm whitespace-nowrap"
          >
            {isLoading ? "Loading…" : "Search"}
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredOrders}
          keyExtractor={(row) => row.id || row.orderNumber}
          emptyMessage="No matching orders found."
        />

        {/* Pagination footer matching screenshot */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-sm text-gray-500">
          <p>
            Showing {totalOrders ? (currentPage - 1) * 20 + 1 : 0}-{Math.min(currentPage * 20, totalOrders)} of {totalOrders} orders
          </p>
          <div className="flex items-center gap-1.5">
            <button disabled={isLoading || currentPage <= 1} onClick={() => void fetchOrders(currentPage - 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center font-bold">
              ‹
            </button>
            <button className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              {currentPage}
            </button>
            <button disabled={isLoading || currentPage >= totalPages} onClick={() => void fetchOrders(currentPage + 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center font-bold">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">
              Edit Order #{editingOrder.orderNumber || editingOrder.id}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editingOrder.customerName || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, customerName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingOrder.customerPhone || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, customerPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Order Status
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, status: e.target.value as Order["status"] })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="PLACED">Placed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="SERVED">Served</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Cancel Order #{cancellingOrder.orderNumber || cancellingOrder.id}?
            </h3>
            <p className="text-gray-500 text-xs mt-1.5">
              This action cannot be undone. Please provide a reason:
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer cancelled before cooking"
              className="w-full mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              rows={3}
            />

            <div className="flex gap-2.5 justify-center mt-6">
              <button
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
