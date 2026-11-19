"use client";

interface Step {
  title: string;
  time?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  timestamps?: {
    placed?: string;
    preparing?: string;
    ready?: string;
    served?: string;
  };
}

export default function OrderTimeline({
  currentStatus,
  timestamps = {
    placed: "2:15 PM",
    preparing: "2:17 PM",
    ready: "2:20 PM",
    served: "Pending",
  },
}: OrderTimelineProps) {
  const norm = (currentStatus || "").toUpperCase();

  // Determine stage progression
  const steps = [
    {
      id: "placed",
      title: "Placed",
      time: timestamps.placed || "2:15 PM",
      done: true,
      current: norm === "PLACED",
      color: "bg-orange-500",
    },
    {
      id: "preparing",
      title: "Preparing",
      time: timestamps.preparing || "2:17 PM",
      done: ["PREPARING", "READY", "SERVED", "COMPLETED"].includes(norm),
      current: norm === "PREPARING",
      color: "bg-orange-500",
    },
    {
      id: "ready",
      title: "Ready",
      time: timestamps.ready || "2:20 PM",
      done: ["READY", "SERVED", "COMPLETED"].includes(norm),
      current: norm === "READY",
      color: "bg-blue-600",
    },
    {
      id: "served",
      title: "Served",
      time: timestamps.served || "Pending",
      done: ["SERVED", "COMPLETED"].includes(norm),
      current: norm === "SERVED" || norm === "COMPLETED",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="w-full">
      {/* Horizontal Stepper matching Screenshot panel 5 */}
      <div className="relative flex items-center justify-between max-w-xl mx-auto py-4">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{
              width:
                norm === "COMPLETED" || norm === "SERVED"
                  ? "100%"
                  : norm === "READY"
                  ? "66%"
                  : norm === "PREPARING"
                  ? "33%"
                  : "0%",
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform ${
                step.done
                  ? step.color
                  : "bg-gray-200 text-gray-400"
              } ${step.current ? "ring-4 ring-orange-200 scale-110" : ""}`}
            >
              {step.done ? "✓" : idx + 1}
            </div>
            <span className="font-bold text-gray-800 text-xs md:text-sm mt-2">
              {step.title}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              {step.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
