"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();

  let style = "bg-gray-100 text-gray-700 border-gray-200";

  if (normalized.includes("prep")) {
    style = "bg-orange-50 text-orange-600 border-orange-200/80";
  } else if (normalized.includes("pend") || normalized.includes("place")) {
    style = "bg-blue-50 text-blue-600 border-blue-200/80";
  } else if (normalized.includes("ready")) {
    style = "bg-indigo-50 text-indigo-600 border-indigo-200/80";
  } else if (normalized.includes("serv")) {
    style = "bg-emerald-50 text-emerald-600 border-emerald-200/80";
  } else if (normalized.includes("compl")) {
    style = "bg-green-50 text-green-700 border-green-200/80";
  } else if (normalized.includes("cancel")) {
    style = "bg-red-50 text-red-600 border-red-200/80";
  }

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-xs font-semibold"
      : "px-3.5 py-1 text-xs md:text-sm font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style} ${sizeClasses} transition-colors`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span className="capitalize">{status.replaceAll("_", " ")}</span>
    </span>
  );
}
