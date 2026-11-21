"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dashboardService, notificationService, Order, ApiError } from "@/services/api";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Home() {

  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statsData, setStatsData] = useState<Record<string, number> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const [stats, recentOrders, notifications] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentOrders(5),
          notificationService.getAll(),
        ]);
        if (active) {
          setStatsData(stats);
          setOrders(recentOrders);
          setUnreadCount(notifications.unreadCount);
          setErrorMessage("");
        }
      } catch (err) {
        if (active) setErrorMessage(err instanceof ApiError ? err.message : "Could not load dashboard data.");
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, []);

  const clearNotifications = async () => {
    if (!unreadCount) return;
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Could not update notifications.");
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: String(statsData?.totalOrders ?? "—"),
      icon: "🛍️",
      color: "text-orange-400",
      line: "bg-orange-500",
    },
    {
      title: "Pending Orders",
      value: String(statsData?.pendingOrders ?? "—"),
      icon: "◷",
      color: "text-yellow-400",
      line: "bg-yellow-500",
    },
    {
      title: "Preparing Orders",
      value: String(statsData?.preparingOrders ?? "—"),
      icon: "👨‍🍳",
      color: "text-green-400",
      line: "bg-green-500",
    },
    {
      title: "Completed Orders",
      value: String(statsData?.completedOrders ?? "—"),
      icon: "✓",
      color: "text-blue-400",
      line: "bg-blue-500",
    },
  ];

  const navigation = [
    { name: "Home", href: "/", icon: "⌂" },
    { name: "New Order", href: "/new-order", icon: "+" },
    { name: "All Orders", href: "/all-orders", icon: "☷" },
    { name: "Kitchen", href: "/kitchen", icon: "♨" },
    { name: "Tracking", href: "/tracking", icon: "♧" },
  ];

  const statusStyle: Record<string, string> = {
    CONFIRMED: "bg-blue-100 text-blue-600",
    ACCEPTED: "bg-blue-100 text-blue-600",
    PREPARING: "bg-orange-100 text-orange-600",
    READY: "bg-green-100 text-green-600",
    PLACED: "bg-blue-100 text-blue-600",
    COMPLETED: "bg-green-100 text-green-600",
    SERVED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (

    <div className="min-h-screen bg-[#F3F4F8] flex flex-col md:flex-row">

      {/* SIDEBAR */}

      <aside className="w-full md:w-[260px] bg-[#101116] text-white flex flex-col justify-between p-5 md:min-h-screen">

        <div>

          {/* LOGO */}

          <div className="mb-12 px-3 pt-3">

            <div className="text-orange-500 text-5xl mb-2">
              ♨
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Dine<span className="text-orange-500">Desk</span>
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Restaurant Management
            </p>

          </div>


          {/* NAVIGATION */}

          <nav className="space-y-3">

            {navigation.map((item) => (

              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-5 px-4 py-3 rounded-xl text-left transition-all ${
                  item.name === "Home"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-300 hover:bg-[#25262D]"
                }`}
              >

                <span className="text-2xl w-7 text-center">
                  {item.icon}
                </span>

                <span className="font-medium">
                  {item.name}
                </span>

              </Link>

            ))}

          </nav>

        </div>


        {/* ADMIN PROFILE */}

        <div className="border-t border-gray-700 pt-6 mt-8">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-[#292A31] border border-orange-500 flex items-center justify-center text-2xl">
              👤
            </div>

            <div className="flex-1">
              <p className="text-xs text-gray-400">
                Logged in as
              </p>

              <p className="font-semibold text-sm">
                {user?.name || "Staff member"}
              </p>
            </div>

            <span className="text-xl cursor-pointer">
              ⇥
            </span>

          </div>

        </div>

      </aside>


      {/* MAIN SECTION */}

      <main className="flex-1 min-w-0 p-4 md:p-7">
        {errorMessage && <p role="alert" className="mb-4 text-sm text-red-600">{errorMessage}</p>}

        {/* TOP HEADER */}

        <header className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-5">

            <button className="text-3xl text-gray-800">
              ☰
            </button>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Home
              </h2>

              <p className="text-gray-500 text-sm">
                Manage your restaurant orders easily
              </p>
            </div>

          </div>


          <div className="flex items-center gap-4">

            <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">

              <span className="w-3 h-3 bg-green-500 rounded-full"></span>

              <span className="text-sm font-semibold">
                {user?.restaurant?.name || "Restaurant"}
              </span>

            </div>

            <button onClick={() => void clearNotifications()} aria-label="Mark notifications as read" className="text-2xl relative">
              ♧
              {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>

            <button type="button" onClick={() => void signOut()} title="Sign out" aria-label="Sign out" className="w-11 h-11 bg-[#101116] rounded-full flex items-center justify-center text-sm font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</button>

          </div>

        </header>


        {/* HERO BANNER */}

        <section
          className="rounded-2xl min-h-[230px] md:min-h-[230px] flex items-center overflow-hidden bg-[#111111] bg-cover bg-center mb-7"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 43%, rgba(10,10,10,0.05) 100%), url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400')"
          }}
        >

          <div className="p-7 md:p-12">

            <span className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg">
              Welcome Back! 👋
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-5">
              Dine<span className="text-orange-500">Desk</span>
            </h1>

            <p className="text-gray-200 mt-3 text-sm md:text-lg">
              Fast • Smart • Reliable Restaurant Management
            </p>

          </div>

        </section>


        {/* STATISTICS CARDS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

          {stats.map((item) => (

            <div
              key={item.title}
              className="bg-[#17181F] rounded-2xl p-5 flex items-center gap-4 shadow-md relative overflow-hidden"
            >

              <div className={`w-16 h-16 rounded-full bg-[#292A32] flex items-center justify-center text-3xl ${item.color}`}>
                {item.icon}
              </div>

              <div className="flex-1">

                <h2 className="text-3xl font-bold text-white">
                  {item.value}
                </h2>

                <p className="text-gray-400 text-sm">
                  {item.title}
                </p>

              </div>

              <div className={`absolute bottom-0 left-0 h-1 w-full ${item.line} opacity-70`}></div>

            </div>

          ))}

        </section>


        {/* RECENT ORDERS AND RESTAURANT INFO */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">


          {/* RECENT ORDERS TABLE */}

          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-5 md:p-6">

            <div className="flex justify-between items-center mb-6">

              <div className="flex items-center gap-3">

                <div className="w-2 h-8 bg-orange-500 rounded-full"></div>

                <h2 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h2>

              </div>

              <Link
                href="/all-orders"
                className="border border-orange-300 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-500 hover:text-white transition"
              >
                View All →
              </Link>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full text-left min-w-[650px]">

                <thead>

                  <tr className="bg-[#F6F7FA] text-gray-500 text-sm">

                    <th className="p-4">Order ID</th>

                    <th className="p-4">Customer Name</th>

                    <th className="p-4">Items</th>

                    <th className="p-4">Status</th>

                    <th className="p-4">Time</th>

                    <th className="p-4">Action</th>

                  </tr>

                </thead>


                <tbody>

                  {orders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-orange-50/40 transition"
                    >

                      <td className="p-4 font-semibold text-gray-800">
                        #{order.orderNumber}
                      </td>

                      <td className="p-4 font-medium text-gray-800">
                        {order.customerName || "Walk-in Guest"}
                      </td>

                      <td className="p-4 text-gray-600">
                        {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                      </td>

                      <td className="p-4">

                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle[order.status] || "bg-gray-100 text-gray-600"}`}>
                          • {order.status.replaceAll("_", " ")}
                        </span>

                      </td>

                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4">

                        <Link
                          href={`/tracking?order=${encodeURIComponent(order.orderNumber)}`}
                          className="border border-orange-300 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-500 hover:text-white transition"
                        >
                          View
                        </Link>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>


          {/* RESTAURANT INFORMATION */}

          <div className="bg-[#17181F] rounded-2xl p-6 text-white flex flex-col justify-between shadow-md">

            <div>

              <div className="flex items-center gap-3 mb-7">

                <span className="text-3xl text-orange-500">
                  🏪
                </span>

                <h2 className="text-lg font-semibold">
                  Restaurant Info
                </h2>

              </div>


              <div className="text-center">

                <h2 className="text-2xl font-bold">
                  {user?.restaurant?.name || "Restaurant"}
                </h2>

                <p className="text-gray-400 mt-2 text-sm">
                  {user?.restaurant?.address || "Restaurant workspace"}
                </p>

                <div className="border-t border-gray-700 my-6"></div>


                <div className="inline-flex items-center gap-2 bg-green-900/40 text-green-400 px-5 py-2 rounded-full text-sm font-semibold">

                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>

                  Open

                </div>


                <div className="text-7xl my-8">
                  🍽️
                </div>

              </div>

            </div>


            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full transition shadow-lg shadow-orange-500/20">

              Manage Restaurant →
              
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}
