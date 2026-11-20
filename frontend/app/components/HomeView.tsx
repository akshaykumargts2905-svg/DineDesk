import type { Order } from "../types";

interface HomeViewProps {
  orders: Order[];
  setView: (view: string) => void;
  setTrackId: (id: string) => void;
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
}

// ── Helpers ──────────────────────────────────────────────────────
const STAGE_META = [
  { status: "Pending",   label: "Pending",   emoji: "🛒", color: "bg-gray-800",   ring: "border-gray-600",  badge: "bg-gray-700 text-gray-300"   },
  { status: "Confirmed", label: "Confirmed", emoji: "📤", color: "bg-blue-700",   ring: "border-blue-500",  badge: "bg-blue-900 text-blue-300"   },
  { status: "Accepted",  label: "Accepted",  emoji: "✅", color: "bg-indigo-700", ring: "border-indigo-500",badge: "bg-indigo-900 text-indigo-300"},
  { status: "Preparing", label: "Preparing", emoji: "👨‍🍳", color: "bg-orange-700", ring: "border-orange-500",badge: "bg-orange-900 text-orange-300"},
  { status: "Ready",     label: "Ready",     emoji: "🍽️", color: "bg-purple-700", ring: "border-purple-500",badge: "bg-purple-900 text-purple-300"},
  { status: "Completed", label: "Completed", emoji: "🎉", color: "bg-green-700",  ring: "border-green-500", badge: "bg-green-900 text-green-300"  },
] as const;

function StageCountCard({ status, label, emoji, color, count }: {
  status: string; label: string; emoji: string; color: string; count: number;
}) {
  return (
    <div className={`${color} text-white rounded-2xl p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        <span className="text-3xl font-black">{count}</span>
      </div>
      <p className="text-sm font-semibold opacity-90 mt-1">{label}</p>
      <p className="text-xs opacity-60">orders</p>
    </div>
  );
}

function WorkflowPipeline({ orders }: { orders: Order[] }) {
  const counts = STAGE_META.map(s => ({
    ...s,
    count: orders.filter(o => o.status === s.status).length,
  }));

  return (
    <div className="bg-black rounded-2xl p-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-base">🔄 Live Order Pipeline</h3>
          <p className="text-gray-400 text-xs mt-0.5">Real-time stage counts across all 6 steps</p>
        </div>
        <span className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-full px-3 py-1 text-xs text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Pipeline bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {counts.map((s, i) => (
          <div key={s.status} className="flex items-center gap-1 flex-1 min-w-[80px]">
            <div className={`flex-1 ${s.color} rounded-xl p-3 text-center`}>
              <div className="text-xl">{s.emoji}</div>
              <div className="text-white text-xl font-black">{s.count}</div>
              <div className="text-white text-[10px] opacity-80 mt-0.5 leading-tight">{s.label}</div>
            </div>
            {i < counts.length - 1 && (
              <span className="text-gray-600 text-xs flex-shrink-0">▶</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffActivity({ orders }: { orders: Order[] }) {
  // Build a flat list of recent history entries sorted newest-first
  type Entry = { orderId: string; status: string; actor: string; at: string };
  const entries: Entry[] = [];
  orders.forEach(o =>
    o.history.forEach(h => entries.push({ orderId: o.id, status: h.status, actor: h.actor, at: h.at }))
  );
  entries.reverse();
  const recent = entries.slice(0, 8);

  const dot: Record<string, string> = {
    Pending:   "bg-gray-400",
    Confirmed: "bg-blue-500",
    Accepted:  "bg-indigo-500",
    Preparing: "bg-orange-500",
    Ready:     "bg-purple-500",
    Completed: "bg-green-500",
    Cancelled: "bg-red-500",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mt-5">
      <h3 className="font-bold text-gray-800 text-sm mb-3">👥 Staff Activity Log</h3>
      {recent.length === 0 ? (
        <p className="text-gray-400 text-xs">No activity yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recent.map((e, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[e.status] ?? "bg-gray-400"}`} />
              <span className="text-xs text-gray-500 w-10 flex-shrink-0">{e.at}</span>
              <span className="text-xs font-semibold text-gray-700 flex-1">{e.actor}</span>
              <span className="text-xs text-gray-500">set</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dot[e.status] ?? "bg-gray-200"} bg-opacity-20 text-gray-700`}>
                {e.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">{e.orderId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentOrdersTable({
  orders, setView, setTrackId,
}: {
  orders: Order[]; setView: (v: string) => void; setTrackId: (id: string) => void;
}) {
  const badgeColor: Record<string, string> = {
    Pending:   "bg-gray-100 text-gray-600",
    Confirmed: "bg-blue-100 text-blue-700",
    Accepted:  "bg-indigo-100 text-indigo-700",
    Preparing: "bg-orange-100 text-orange-600",
    Ready:     "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex-1 bg-white p-5 rounded-2xl overflow-x-auto shadow-sm">
      <div className="flex justify-between mb-3">
        <h3 className="font-bold text-lg">| Recent Orders</h3>
        <button onClick={() => setView("All Orders")} className="text-orange-500 text-sm">
          View All →
        </button>
      </div>
      <table className="w-full text-sm mt-1">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="pb-2">Order ID</th>
            <th className="pb-2">Customer</th>
            <th className="pb-2">Table</th>
            <th className="pb-2">Items</th>
            <th className="pb-2">Stage</th>
            <th className="pb-2">Time</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 6).map(o => (
            <tr key={o.id} className="border-t">
              <td className="py-3 font-mono text-xs">{o.id}</td>
              <td className="font-bold">{o.name}</td>
              <td className="text-gray-500">T-{o.table}</td>
              <td className="text-gray-500">{o.qty} item{o.qty !== 1 ? "s" : ""}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                  ● {o.status}
                </span>
              </td>
              <td className="text-gray-400 text-xs">{o.time}</td>
              <td>
                <button
                  onClick={() => { setTrackId(o.id); setView("Tracking"); }}
                  className="border border-orange-400 text-orange-500 px-2 py-1 rounded-full text-xs hover:bg-orange-50"
                >
                  Track
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RestaurantInfoCard({ setView, isOnline, setIsOnline }: {
  setView: (v: string) => void; isOnline: boolean; setIsOnline: (v: boolean) => void;
}) {
  return (
    <div className="w-[260px] bg-black text-white p-5 rounded-2xl hidden lg:block text-center flex-shrink-0">
      <p className="text-xs text-gray-400">🏠 Restaurant Info</p>
      <h3 className="font-bold text-lg">DineDesk Bistro</h3>
      <p className="text-gray-400 text-sm">Good Food, Good Mood!</p>
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mt-2 font-semibold transition-colors ${
          isOnline ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-gray-400"}`} />
        {isOnline ? "● Online" : "● Offline"}
      </button>
      <div className="text-5xl my-4">🍽️</div>
      <button
        onClick={() => setView("Kitchen")}
        className="bg-orange-500 py-2 rounded-full font-bold w-full hover:bg-orange-600 transition-colors text-sm"
      >
        Open Kitchen →
      </button>
    </div>
  );
}

export default function HomeView({ orders, setView, setTrackId, isOnline, setIsOnline }: HomeViewProps) {
  const active = orders.filter(o =>
    o.status !== "Completed" && o.status !== "Cancelled"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Admin · Live order pipeline overview</p>
        </div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm shadow h-fit font-medium transition-colors ${
            isOnline ? "bg-white text-green-600" : "bg-white text-gray-500"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {isOnline ? "Restaurant Online" : "Restaurant Offline"}
        </button>
      </div>

      {/* Hero banner */}
      <div className="bg-black text-white p-6 rounded-2xl mt-5 flex justify-between items-center">
        <div>
          <span className="bg-orange-500 px-3 py-1 rounded-full text-sm">
            Welcome Back! 👋
          </span>
          <h2 className="text-4xl font-bold mt-3">
            Dine<span className="text-orange-500">Desk</span>
          </h2>
          <p className="mt-1 text-gray-300">
            {active} active order{active !== 1 ? "s" : ""} · Fast · Smart · Reliable
          </p>
        </div>
        <div className="text-6xl hidden sm:block">🍔🍟</div>
      </div>

      {/* Live 6-stage pipeline */}
      <WorkflowPipeline orders={orders} />

      {/* Table + sidebar */}
      <div className="flex gap-4 mt-5">
        <RecentOrdersTable orders={orders} setView={setView} setTrackId={setTrackId} />
        <RestaurantInfoCard setView={setView} isOnline={isOnline} setIsOnline={setIsOnline} />
      </div>

      {/* Staff activity */}
      <StaffActivity orders={orders} />
    </div>
  );
}
