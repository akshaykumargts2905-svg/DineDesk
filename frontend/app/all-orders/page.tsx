"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/common/StatusBadge";
import SearchBar from "@/components/common/SearchBar";
import FilterDropdown from "@/components/common/FilterDropdown";
import DataTable from "@/components/common/DataTable";
import OrderDetails from "@/components/orders/OrderDetails";
import { orderService, MOCK_ORDERS } from "@/services/api";

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<any[]>(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Fetch orders from backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      (order.orderNumber || order.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (order.status || "").toLowerCase() === statusFilter.toLowerCase() ||
      (order.statusEnum || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "ALL" ||
      (order.orderType || "").toLowerCase() === typeFilter.toLowerCase() ||
      (order.orderTypeEnum || "").toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle Edit Save
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? { ...o, ...editingOrder } : o))
      );
      setEditingOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      await orderService.cancel(cancellingOrder.id, cancelReason || "Customer request");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancellingOrder.id
            ? { ...o, status: "Cancelled", statusEnum: "CANCELLED" }
            : o
        )
      );
      setCancellingOrder(null);
      setCancelReason("");
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      header: "Order ID",
      render: (row: any) => (
        <span className="font-bold text-gray-900">
          #{row.orderNumber || row.id}
        </span>
      ),
    },
    {
      header: "Customer",
      render: (row: any) => (
        <span className="font-semibold text-gray-800">
          {row.customerName || "Walk-in Guest"}
        </span>
      ),
    },
    {
      header: "Items",
      render: (row: any) => (
        <span className="text-gray-600 font-medium">
          {row.items || (row.itemList ? `${row.itemList.length} Items` : "1 Item")}
        </span>
      ),
    },
    {
      header: "Type",
      render: (row: any) => (
        <span className="text-gray-600 font-medium">{row.orderType}</span>
      ),
    },
    {
      header: "Date & Time",
      render: (row: any) => (
        <span className="text-gray-500 text-xs md:text-sm">
          {row.createdAt || "19 Nov, 2:15 PM"}
        </span>
      ),
    },
    {
      header: "Total",
      render: (row: any) => (
        <span className="font-extrabold text-gray-900">₹{row.total}</span>
      ),
    },
    {
      header: "Status",
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          {/* View Details */}
          <button
            onClick={() => setSelectedOrder(row)}
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
              { label: "Pending", value: "Pending" },
              { label: "Preparing", value: "Preparing" },
              { label: "Ready", value: "Ready" },
              { label: "Served", value: "Served" },
              { label: "Completed", value: "Completed" },
              { label: "Cancelled", value: "Cancelled" },
            ]}
            className="w-full sm:w-44"
          />

          <FilterDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All Type", value: "ALL" },
              { label: "Dine In", value: "Dine In" },
              { label: "Takeaway", value: "Takeaway" },
              { label: "Delivery", value: "Delivery" },
            ]}
            className="w-full sm:w-40"
          />

          <button
            onClick={fetchOrders}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer text-sm whitespace-nowrap"
          >
            Search
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
            Showing 1-{filteredOrders.length} of {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center font-bold">
              ‹
            </button>
            <button className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 flex items-center justify-center font-bold">
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
                    setEditingOrder({ ...editingOrder, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Served">Served</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
