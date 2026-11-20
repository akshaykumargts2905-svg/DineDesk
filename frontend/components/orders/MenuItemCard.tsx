"use client";

import type { MenuItem } from "@/services/api";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80";

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all group">
      {/* Food Image */}
      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 relative mb-3">
        <img
          src={item.imageUrl || fallbackImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h4 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-1">
          {item.name}
        </h4>
        <p className="text-orange-500 font-extrabold text-sm md:text-base mt-1">
          ₹{item.price}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAdd(item)}
        disabled={item.isAvailable === false}
        className="mt-3 w-full bg-[#101116] hover:bg-orange-500 text-white font-semibold py-2 px-3 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Add</span>
        <span className="text-base font-bold">+</span>
      </button>
    </div>
  );
}
