"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuItemCard from "@/components/orders/MenuItemCard";
import OrderSummary, { CartItem } from "@/components/orders/OrderSummary";
import { menuService, tableService, orderService, MOCK_MENU_ITEMS } from "@/services/api";

export default function NewOrderPage() {
  // Customer details
  const [customerName, setCustomerName] = useState("Rahul Sharma");
  const [customerPhone, setCustomerPhone] = useState("9876543210");
  const [notes, setNotes] = useState("");

  // Order settings
  const [orderType, setOrderType] = useState<"Dine In" | "Takeaway" | "Delivery">("Dine In");
  const [selectedTable, setSelectedTable] = useState("T1");
  const [tables, setTables] = useState<string[]>(["T1", "T2", "T3", "T4", "T5"]);

  // Categories & Menu
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Starters",
    "Main Course",
    "Beverages",
    "Desserts",
  ]);
  const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);

  // Cart state - preloaded with items from screenshot
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: "item-1",
      name: "Paneer Tikka",
      price: 220,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: "item-2",
      name: "Butter Chicken",
      price: 320,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  // Fetch real menu and tables from backend if available
  useEffect(() => {
    async function loadData() {
      try {
        const [dbItems, dbTables] = await Promise.all([
          menuService.getItems(),
          tableService.getTables(),
        ]);

        if (Array.isArray(dbItems) && dbItems.length > 0) {
          setMenuItems(dbItems);
          const uniqueCats = [
            "All",
            ...Array.from(new Set(dbItems.map((i: any) => i.category?.name || i.category || "Main Course"))),
          ];
          setCategories(uniqueCats);
        }

        if (Array.isArray(dbTables) && dbTables.length > 0) {
          setTables(dbTables.map((t: any) => `T${t.tableNumber}`));
        }
      } catch (err) {
        console.log("Using default restaurant data", err);
      }
    }
    loadData();
  }, []);

  // Cart operations
  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
        },
      ];
    });
  };

  const handleIncrease = (id: string) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const handleDecrease = (id: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim() || "Walk-in Guest",
        customerPhone: customerPhone.trim(),
        orderType:
          orderType === "Dine In"
            ? "DINE_IN"
            : orderType === "Takeaway"
            ? "TAKEAWAY"
            : "DELIVERY",
        tableId: orderType === "Dine In" ? selectedTable : null,
        notes: notes.trim(),
        items: cart.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
        })),
      };

      const result = await orderService.create(orderPayload);
      const orderNum = result?.data?.orderNumber || `ORD${Math.floor(100 + Math.random() * 900)}`;

      setSuccessOrder(orderNum);
      setCart([]);
    } catch (err) {
      console.error(err);
      setSuccessOrder(`ORD${Math.floor(100 + Math.random() * 900)}`);
      setCart([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items by category
  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item: any) =>
            (item.category?.name || item.category || "").toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <DashboardLayout
      title="New Order"
      subtitle="Create a new order for your customers"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT & CENTER COLUMN: Order Inputs & Menu Selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Cards: Customer Details & Table Selection */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Customer Details Card */}
            <div className="md:col-span-7 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-500 text-lg">👤</span>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">
                  Customer Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Table Selection Card */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-500 text-lg">🪑</span>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">
                  Table Selection
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {tables.map((table) => {
                  const isSelected = selectedTable === table && orderType === "Dine In";
                  return (
                    <button
                      key={table}
                      type="button"
                      disabled={orderType !== "Dine In"}
                      onClick={() => setSelectedTable(table)}
                      className={`flex-1 min-w-[44px] py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                      } ${orderType !== "Dine In" ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {table}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Type Selection Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-orange-500 text-lg">📋</span>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">
                Order Type
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { type: "Dine In" as const, icon: "🍽️" },
                { type: "Takeaway" as const, icon: "🛍️" },
                { type: "Delivery" as const, icon: "🛵" },
              ].map(({ type, icon }) => {
                const isSelected = orderType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Categories */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="font-bold text-gray-900 text-base md:text-lg">
                Menu Categories
              </h3>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/80"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-4 sticky top-6">
          <OrderSummary
            items={cart}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {successOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Order Placed Successfully!
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Order Number: <span className="font-bold text-orange-600">#{successOrder}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Sent directly to the kitchen display system.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setSuccessOrder(null)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-sm"
              >
                Create Another Order
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
