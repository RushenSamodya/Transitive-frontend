"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navItems = role === "admin" ? adminNav : depotNav;
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Bus className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">TransitLive</p>
          <p className="text-xs text-slate-400">
            {role === "admin" ? "Administrator" : "Depot Manager"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="mb-3">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => setShowSignOutDialog(true)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
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
  );
}
