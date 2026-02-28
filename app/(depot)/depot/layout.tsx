"use client";

import { useState } from "react";
import { Menu, Bus } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";

export default function DepotLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="depot_manager"
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* ── Mobile top bar ── */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg">
              <Bus className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">TransitLive</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
