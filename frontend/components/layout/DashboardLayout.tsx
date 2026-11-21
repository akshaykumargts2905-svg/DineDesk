"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/components/auth/AuthProvider";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F3F4F8] flex">
      {/* Reusable Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-7 max-w-[1600px] w-full mx-auto">
          {/* Reusable Header */}
          <Header
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          {user?.isDemo && (
            <div role="status" className="mb-5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
              Demo mode is read-only. You can explore sample restaurant data, but changes are disabled.
            </div>
          )}

          {/* Page Specific Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
