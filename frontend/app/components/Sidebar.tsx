"use client";
import { useRef, useEffect, useState } from "react";
import type { Role } from "../types";

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
  menus: string[];
  icons: Record<string, string>;
  role: Role;
  setRole: (role: Role) => void;
  isOnline: boolean;
  setIsOnline: (v: boolean) => void;
}

const ROLES: { label: Role; icon: string; desc: string }[] = [
  { label: "Admin",         icon: "👑", desc: "Full access + all actions" },
  { label: "Waiter",        icon: "🛎️",  desc: "Confirm orders · Mark served" },
  { label: "Kitchen Staff", icon: "👨‍🍳", desc: "Accept · Cook · Mark ready" },
  { label: "Customer",      icon: "👤", desc: "Place order & track" },
];

const ROLE_COLOR: Record<Role, string> = {
  Admin:          "bg-orange-500",
  Waiter:         "bg-purple-500",
  "Kitchen Staff":"bg-blue-500",
  Customer:       "bg-green-500",
};

export default function Sidebar({
  view, setView, menus, icons, role, setRole, isOnline, setIsOnline,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="w-64 bg-black text-white p-5 hidden md:flex flex-col fixed h-full">
      {/* Logo */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold">
          Dine<span className="text-orange-500">Desk</span>
        </h1>
        <p className="text-xs text-gray-400">Restaurant Management</p>
      </div>

      {/* Online toggle */}
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit transition-colors ${
          isOnline ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
        {isOnline ? "Restaurant Online" : "Restaurant Offline"}
      </button>

      {/* Nav */}
      <div className="mt-6 space-y-1 flex-1">
        {menus.map((m) => (
          <button
            key={m}
            onClick={() => setView(m)}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${
              view === m ? "bg-orange-500" : "hover:bg-gray-800"
            }`}
          >
            <span>{icons[m]}</span>
            <span>{m}</span>
          </button>
        ))}
      </div>

      {/* Role switcher */}
      <div className="relative mt-auto" ref={popupRef}>
        {open && (
          <div className="absolute bottom-full mb-3 left-0 w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest px-4 pt-3 pb-1">
              Switch role
            </p>
            {ROLES.map((r) => (
              <button
                key={r.label}
                onClick={() => { setRole(r.label); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  role === r.label ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${ROLE_COLOR[r.label]}`}>
                  {r.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{r.label}</p>
                  <p className="text-[10px] text-gray-400">{r.desc}</p>
                </div>
                {role === r.label && (
                  <span className="text-orange-400 text-xs font-bold">✓</span>
                )}
              </button>
            ))}
            <div className="h-px bg-gray-700 mx-4 my-1" />
            <p className="text-[10px] text-gray-600 px-4 py-2">Role controls visible menu items</p>
          </div>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-900 transition-colors group text-left"
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${ROLE_COLOR[role]}`}>
            {ROLES.find((r) => r.label === role)?.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{role}</p>
          </div>
          <span className="text-gray-500 text-xs group-hover:text-gray-300 transition-colors">
            {open ? "▲" : "▼"}
          </span>
        </button>
      </div>
    </div>
  );
}
