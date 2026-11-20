"use client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
}

export default function OrderSummary({
  items,
  onIncrease,
  onDecrease,
  onRemove,
  onPlaceOrder,
  isSubmitting = false,
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div>
        {/* Title */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <span className="text-xl text-orange-500">🛒</span>
          <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>
          {items.length > 0 && (
            <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-bold px-2.5 py-0.5 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="py-4 space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="text-xs text-gray-400 mt-1">Select items from menu to add.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-[#F9FAFC] p-2.5 rounded-xl border border-gray-100/80"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-xs md:text-sm truncate">
                    {item.name}
                  </h5>
                  <p className="text-orange-500 font-bold text-xs mt-0.5">
                    ₹{item.price * item.quantity}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-2xs">
                  <button
                    onClick={() => onDecrease(item.id)}
                    className="text-gray-500 hover:text-orange-600 font-bold text-xs w-4 h-4 flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-gray-800 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onIncrease(item.id)}
                    className="text-gray-500 hover:text-orange-600 font-bold text-xs w-4 h-4 flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1 text-sm transition-colors"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill & Place Order CTA */}
      <div className="pt-4 border-t border-gray-100 mt-2">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (5%)</span>
            <span className="font-semibold text-gray-800">&#8377;{tax}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-dashed border-gray-200">
            <span>Total</span>
            <span className="text-orange-600 text-lg">₹{total}</span>
          </div>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={items.length === 0 || isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 text-sm md:text-base disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <span>Placing Order...</span>
          ) : (
            <>
              <span>Place Order</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
