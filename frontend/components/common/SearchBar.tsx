"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search by Order ID or Customer...",
  className = "",
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-base">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm"
      />
    </div>
  );
}
