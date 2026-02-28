"use client";

import { useDepots } from "@/hooks/useDepots";
import { useBuses } from "@/hooks/useBuses";
import { useSchedules } from "@/hooks/useSchedules";
import { useDrivers } from "@/hooks/useDrivers";
import { useConductors } from "@/hooks/useConductors";
import { useRoutes } from "@/hooks/useRoutes";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBar } from "@/components/shared/StatusBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageLoader } from "@/components/shared/PageLoader";
import {
  Building2,
  Bus,
  Calendar,
  Map,
  Users,
  UserCheck,
  Activity,
  Clock,
  Wrench,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// ─── Schedule status maps ──────────────────────────────────────────────────────
const scheduleBadge: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const scheduleLabel: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ─── Status color maps ────────────────────────────────────────────────────────
const fleetColors: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-amber-400",
  maintenance: "bg-blue-500",
  breakdown: "bg-red-500",
};

const scheduleColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  in_progress: "bg-emerald-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-400",
};

const staffColors: Record<string, string> = {
  available: "bg-emerald-500",
  on_duty: "bg-blue-500",
  off: "bg-slate-400",
  leave: "bg-amber-400",
};

const fleetStatuses = ["active", "inactive", "maintenance", "breakdown"] as const;
const scheduleStatuses = ["scheduled", "in_progress", "completed", "cancelled"] as const;
const staffStatuses = ["available", "on_duty", "off", "leave"] as const;

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { data: depots, isLoading: loadingDepots } = useDepots();
  const { data: buses, isLoading: loadingBuses } = useBuses();
  const { data: schedules, isLoading: loadingSchedules } = useSchedules();
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const { data: conductors, isLoading: loadingConductors } = useConductors();
  const { data: routes, isLoading: loadingRoutes } = useRoutes();

  const isLoading =
    loadingDepots || loadingBuses || loadingSchedules ||
    loadingDrivers || loadingConductors || loadingRoutes;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const activeBuses = buses?.filter((b) => b.status === "active").length ?? 0;
  const totalBuses = buses?.length ?? 0;
  const availableDrivers = drivers?.filter((d) => d.availability === "available").length ?? 0;
  const availableConductors = conductors?.filter((c) => c.availability === "available").length ?? 0;

  const todaySchedules = schedules?.filter((s) => {
    const d = s.date ? new Date(s.date).toISOString().split("T")[0] : null;
    return d === todayStr;
  }) ?? [];

  const activeToday = todaySchedules.filter(
    (s) => s.status === "scheduled" || s.status === "in_progress"
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Hero banner shows immediately — only static content */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-6 text-white shadow-md">
          <p className="text-indigo-200 text-sm font-medium mb-1">
            {format(now, "EEEE, MMMM d yyyy")}
          </p>
          <h1 className="text-2xl font-bold">System Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1">
            SLTB fleet overview across all depots
          </p>
        </div>
        <PageLoader label="Fetching fleet data…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-6 text-white shadow-md">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">
              {format(now, "EEEE, MMMM d yyyy")}
            </p>
            <h1 className="text-2xl font-bold">System Dashboard</h1>
            <p className="text-indigo-200 text-sm mt-1">
              SLTB fleet overview across all depots
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {isLoading ? "—" : `${activeToday} Active Today`}
              </span>
            </div>
            <p className="text-indigo-200 text-sm">{format(now, "HH:mm 'hrs'")}</p>
          </div>
        </div>

        {!isLoading && (
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { label: `${depots?.length ?? 0} Depots`, icon: Building2 },
              { label: `${totalBuses} Buses`, icon: Bus },
              { label: `${routes?.length ?? 0} Routes`, icon: Map },
              { label: `${(drivers?.length ?? 0) + (conductors?.length ?? 0)} Staff`, icon: Users },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <StatCard title="Depots" value={depots?.length} icon={Building2} color="bg-indigo-500" loading={isLoading} />
        <StatCard title="Routes" value={routes?.length} icon={Map} color="bg-purple-500" loading={isLoading} />
        <StatCard title="Buses" value={totalBuses} sub={`${activeBuses} active`} icon={Bus} color="bg-blue-500" loading={isLoading} />
        <StatCard title="Drivers" value={drivers?.length} sub={`${availableDrivers} available`} icon={Users} color="bg-teal-500" loading={isLoading} />
        <StatCard title="Conductors" value={conductors?.length} sub={`${availableConductors} available`} icon={UserCheck} color="bg-cyan-500" loading={isLoading} />
        <StatCard title="Active Today" value={activeToday} sub="schedules running" icon={Calendar} color="bg-emerald-500" loading={isLoading} />
      </div>

      {/* ── Fleet Health + Schedule Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard icon={Wrench} title="Fleet Health" subtitle={`${totalBuses} buses total`}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-full" />)}
            </div>
          ) : (
            fleetStatuses.map((s) => (
              <StatusBar
                key={s}
                label={s}
                count={buses?.filter((b) => b.status === s).length ?? 0}
                total={totalBuses}
                color={fleetColors[s]}
              />
            ))
          )}
        </SectionCard>

        <SectionCard icon={Calendar} title="All Schedules" subtitle={`${schedules?.length ?? 0} total schedules`}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-full" />)}
            </div>
          ) : (
            scheduleStatuses.map((s) => (
              <StatusBar
                key={s}
                label={s}
                count={schedules?.filter((sc) => sc.status === s).length ?? 0}
                total={schedules?.length ?? 0}
                color={scheduleColors[s]}
              />
            ))
          )}
        </SectionCard>
      </div>

      {/* ── Today's Schedules ── */}
      <SectionCard
        icon={Clock}
        title="Today's Schedules"
        action={<span className="text-sm text-slate-400">{format(now, "MMM d, yyyy")}</span>}
        noPadding
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : todaySchedules.length === 0 ? (
          <EmptyState icon={Calendar} message="No schedules for today" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  {["Route", "Bus", "Driver", "Departure", "Trips", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todaySchedules.slice(0, 8).map((s) => (
                  <tr key={s._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-700">{s.routeId?.routeName ?? "—"}</p>
                      <p className="text-sm text-slate-400">
                        {s.routeId?.startLocation} → {s.routeId?.endLocation}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.busId?.number ?? "—"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.driverId?.name ?? "—"}</td>
                    <td className="py-3.5 px-4 text-slate-600 tabular-nums">{s.departureTime}</td>
                    <td className="py-3.5 px-4 text-slate-600 tabular-nums">{s.tripsDone}/{s.tripsTotal}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${scheduleBadge[s.status] ?? ""}`}>
                        {scheduleLabel[s.status] ?? s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {todaySchedules.length > 8 && (
              <p className="text-center text-sm text-slate-400 py-3 border-t">
                +{todaySchedules.length - 8} more schedules today
              </p>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── Staff Availability + Depots ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard icon={Users} title="Staff Availability">
          {isLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                  Drivers ({drivers?.length ?? 0})
                </p>
                {staffStatuses.map((s) => (
                  <StatusBar
                    key={s}
                    label={s}
                    count={drivers?.filter((d) => d.availability === s).length ?? 0}
                    total={drivers?.length ?? 0}
                    color={staffColors[s]}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                  Conductors ({conductors?.length ?? 0})
                </p>
                {staffStatuses.map((s) => (
                  <StatusBar
                    key={s}
                    label={s}
                    count={conductors?.filter((c) => c.availability === s).length ?? 0}
                    total={conductors?.length ?? 0}
                    color={staffColors[s]}
                  />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Building2}
          title="Depots"
          action={
            <Link href="/admin/depots" className="text-sm text-indigo-600 hover:underline font-medium">
              Manage →
            </Link>
          }
          noPadding
        >
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !depots?.length ? (
            <EmptyState icon={Building2} message="No depots found" />
          ) : (
            <div>
              {depots.slice(0, 5).map((depot, i) => (
                <div
                  key={depot._id}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors ${
                    i < Math.min(depots.length, 5) - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{depot.name}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {depot.city}
                      </p>
                    </div>
                  </div>
                  {depot.managerId ? (
                    <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                      {depot.managerId.name.split(" ")[0]}
                    </span>
                  ) : (
                    <span className="text-sm text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      No manager
                    </span>
                  )}
                </div>
              ))}
              {depots.length > 5 && (
                <p className="text-center text-sm text-slate-400 py-3 border-t">
                  +{depots.length - 5} more depots
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
