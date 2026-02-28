"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Bus,
  LayoutDashboard,
  Route,
  Users,
  Wrench,
  Calendar,
  UserCheck,
  UserCog,
  LogOut,
  Building2,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Depots", href: "/admin/depots", icon: Building2 },
  { label: "Routes", href: "/admin/routes", icon: Route },
  { label: "Users", href: "/admin/users", icon: Users },
];

const depotNav: NavItem[] = [
  { label: "Dashboard", href: "/depot/dashboard", icon: LayoutDashboard },
  { label: "Buses", href: "/depot/buses", icon: Bus },
  { label: "Drivers", href: "/depot/drivers", icon: UserCheck },
  { label: "Conductors", href: "/depot/conductors", icon: UserCog },
  { label: "Schedules", href: "/depot/schedules", icon: Calendar },
  { label: "Maintenance", href: "/depot/maintenance", icon: Wrench },
];

interface SidebarProps {
  role: "admin" | "depot_manager";
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ role, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navItems = role === "admin" ? adminNav : depotNav;
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
      />

      {/* ── Sidebar panel ── */}
      <aside
        className={cn(
          // Base styles
          "flex flex-col w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-r border-slate-700/50 shrink-0",
          // Mobile: fixed drawer that slides in/out
          "fixed inset-y-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static in the flex row, always visible
          "lg:relative lg:translate-x-0"
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight tracking-tight">
              TransitLive
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {role === "admin" ? "Administrator" : "Depot Manager"}
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Section label ── */}
        <div className="px-5 mb-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Navigation
          </p>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-blue-600/20 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {/* Active left bar */}
                <div
                  className={cn(
                    "absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-blue-400 transition-all duration-300 ease-out",
                    active ? "h-6 opacity-100" : "h-0 opacity-0"
                  )}
                />

                {/* Icon box */}
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 shrink-0",
                    active
                      ? "bg-blue-500 shadow-md shadow-blue-500/40"
                      : "bg-slate-800 group-hover:bg-slate-700"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-all duration-200 group-hover:scale-110",
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    )}
                  />
                </div>

                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  {item.label}
                </span>

                {active && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-400 opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── User section ── */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-700/60 space-y-1.5">
          {/* User info card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 text-xs font-bold shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-medium"
          >
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-800 group-hover:bg-red-500/20 transition-colors duration-200 shrink-0">
              <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </div>
            Sign Out
          </button>
        </div>

        <ConfirmDialog
          open={showSignOutDialog}
          onOpenChange={setShowSignOutDialog}
          title="Sign Out"
          description="Are you sure you want to sign out?"
          onConfirm={logout}
          confirmLabel="Sign Out"
          variant="destructive"
        />
      </aside>
    </>
  );
}
