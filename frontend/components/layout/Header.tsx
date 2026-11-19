"use client";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-2xl text-gray-800 p-1.5 rounded-lg hover:bg-gray-200 transition"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Restaurant Status dropdown pill */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 text-xs md:text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-50 transition">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          <span>Restaurant Demo</span>
          <span className="text-gray-400 text-xs">▼</span>
        </div>

        {/* Notifications */}
        <button
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg text-gray-700 relative hover:bg-gray-50 transition"
          aria-label="Notifications"
        >
          ♧
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-[#101116] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm border border-gray-800">
          A
        </div>
      </div>
    </header>
  );
}
