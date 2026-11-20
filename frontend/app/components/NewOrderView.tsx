import type { Role } from "../types";

export type MenuItem = {
  name: string;
  price: number;
  emoji: string;
};

export type CartItem = {
  name: string;
  price: number;
  qty: number;
};

export const DEFAULT_MENU: MenuItem[] = [
  { name: "Veg Burger",       price: 149, emoji: "🍔" },
  { name: "French Fries",     price: 89,  emoji: "🍟" },
  { name: "Margherita Pizza", price: 249, emoji: "🍕" },
  { name: "Paneer Tikka",     price: 199, emoji: "🍢" },
  { name: "Pasta Alfredo",    price: 219, emoji: "🍝" },
  { name: "Cold Coffee",      price: 99,  emoji: "🥤" },
];

interface NewOrderViewProps {
  customer: string;
  setCustomer: (val: string) => void;
  table: string;
  setTable: (val: string) => void;
  note: string;
  setNote: (val: string) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (item: { name: string; price: number }) => void;
  placeOrder: () => void;
  total: number;
  menu?: MenuItem[];
  role: Role;
}

export default function NewOrderView({
  customer, setCustomer,
  table, setTable,
  note, setNote,
  cart, setCart, addToCart,
  placeOrder, total,
  menu = DEFAULT_MENU,
  role,
}: NewOrderViewProps) {
  // Role determines what happens after clicking Place
  const isWaiter  = role === "Waiter"  || role === "Admin";
  const btnLabel  = isWaiter
    ? "📤 Place & Save as Pending"
    : "🛒 Place Order";

  const roleHint  = isWaiter
    ? "Order will be saved as Pending. Go to All Orders or Tracking to Confirm & Send to Kitchen."
    : "Your order will be saved as Pending. A waiter will confirm and send it to the kitchen.";

  return (
    <div>
      <h1 className="text-3xl font-bold">New Order</h1>
      <p className="text-gray-500">Place a new order for a table</p>

      {/* Role hint */}
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
        <p className="text-xs text-blue-700 font-medium">ℹ️ {roleHint}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        {/* Menu grid */}
        <div className="flex-1 bg-white p-5 rounded-2xl h-fit">
          <h3 className="font-bold text-lg">| Choose dishes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
            {menu.map(m => (
              <button
                key={m.name}
                onClick={() => addToCart(m)}
                className="border rounded-xl p-4 hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <div className="text-4xl">{m.emoji}</div>
                <p className="font-medium mt-2 text-sm">{m.name}</p>
                <p className="text-gray-500 text-sm">₹{m.price}</p>
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">Tap a dish to add it to the order →</p>
        </div>

        {/* Order details */}
        <div className="w-full lg:w-[320px] bg-white p-5 rounded-2xl h-fit">
          <h3 className="font-bold text-lg">| Order details</h3>

          <label className="font-bold text-sm mt-4 block">Customer name</label>
          <input
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full border rounded-lg p-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          <label className="font-bold text-sm mt-3 block">Table number</label>
          <input
            value={table}
            onChange={e => setTable(e.target.value)}
            placeholder="e.g. 7"
            type="number"
            className="w-full border rounded-lg p-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          <label className="font-bold text-sm mt-4 block">Items {cart.length === 0 && <span className="text-gray-400 font-normal">(none yet)</span>}</label>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">{item.name}</span>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={item.qty}
                  min={1}
                  onChange={e => {
                    const n = [...cart];
                    n[idx] = { ...n[idx], qty: Math.max(1, Number(e.target.value)) };
                    setCart(n);
                  }}
                  className="w-12 border rounded p-1 text-sm text-center"
                />
                <button
                  onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                  className="text-red-500 border border-red-500 rounded-full w-7 h-7 text-sm flex items-center justify-center hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <label className="font-bold text-sm mt-4 block">Kitchen note (optional)</label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. no onions, extra spicy"
            className="w-full border rounded-lg p-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          <p className="font-bold mt-4 text-lg">Total: ₹{total}</p>

          <button
            onClick={placeOrder}
            className="bg-orange-500 text-white px-4 py-2.5 rounded-full font-bold mt-3 w-full hover:bg-orange-600 transition-colors"
          >
            {btnLabel}
          </button>

          {/* Workflow hint */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 font-semibold mb-1.5">📋 Workflow steps after placing:</p>
            {[
              { n: "2", label: "Waiter confirms & sends to kitchen", who: "Waiter" },
              { n: "3", label: "Kitchen accepts",                    who: "Kitchen" },
              { n: "4", label: "Kitchen starts cooking",             who: "Kitchen" },
              { n: "5", label: "Kitchen marks ready",                who: "Kitchen" },
              { n: "6", label: "Waiter marks served",                who: "Waiter"  },
            ].map(step => (
              <div key={step.n} className="flex items-center gap-2 mb-1">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {step.n}
                </span>
                <span className="text-[10px] text-gray-600 flex-1">{step.label}</span>
                <span className="text-[9px] text-gray-400">{step.who}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
