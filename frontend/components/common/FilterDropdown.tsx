"use client";

interface Option {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export default function FilterDropdown({
  value,
  onChange,
  options,
  className = "",
}: FilterDropdownProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-sm cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-xs">
        ▼
      </div>
    </div>
  );
}
