"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: "⌂" },
    { name: "New Order", href: "/new-order", icon: "+" },
    { name: "All Orders", href: "/all-orders", icon: "☷" },
    { name: "Kitchen", href: "/kitchen", icon: "♨" },
    { name: "Tracking", href: "/tracking", icon: "♧" },
    { name: "Menu Management", href: "/menu-management", icon: "M" },
    { name: "Table Management", href: "/table-management", icon: "T" },
  ].filter((item) => {
    if (item.href === "/") return user?.role === "RESTAURANT_ADMIN" || user?.role === "MANAGER";
    if (item.href === "/menu-management" || item.href === "/table-management") return user?.role === "RESTAURANT_ADMIN" || user?.role === "MANAGER";
    if (item.href === "/kitchen") return user?.role !== "FRONT_OF_HOUSE";
    if (item.href === "/tracking") return user?.role !== "KITCHEN_STAFF";
    if (item.href === "/new-order") return user?.role !== "KITCHEN_STAFF";
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#101116] text-white flex flex-col justify-between p-5 min-h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* LOGO */}
          <div className="mb-10 px-3 pt-3 flex justify-between items-start">
            <Link href="/" className="group block">
              <div className="text-orange-500 text-5xl mb-2 transition-transform group-hover:scale-105">
                ♨
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Dine<span className="text-orange-500">Desk</span>
              </h1>
              <p className="text-gray-400 text-xs mt-1 font-medium tracking-wide">
                Restaurant Management
              </p>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white p-2 text-2xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-2.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all font-medium text-sm ${
                    active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-gray-300 hover:bg-[#1E1F27] hover:text-white"
                  }`}
                >
                  <span className="text-2xl w-6 text-center">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ADMIN PROFILE */}
        <div className="border-t border-gray-800/80 pt-5 mt-6">
          <div className="flex items-center gap-3 bg-[#181920] p-3 rounded-xl border border-gray-800/60">
            <div className="w-10 h-10 rounded-full bg-[#292A31] border border-orange-500 flex items-center justify-center text-xl text-white">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">Logged in as</p>
              <p className="font-semibold text-xs text-white truncate">
                {user?.name || "Staff member"}
              </p>
            </div>
            <button onClick={() => void signOut()} aria-label="Sign out" title="Sign out" className="text-gray-400 hover:text-orange-400 text-xs cursor-pointer transition-colors">
              ⇥
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
