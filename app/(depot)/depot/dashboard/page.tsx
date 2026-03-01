"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBar } from "@/components/shared/StatusBar";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/PageLoader";
import {
  Bus,
  Users,
  AlertTriangle,
  Wrench,
  Flag,
  Calendar,
  UserCheck,
  UserCog,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DepotStats {
  idleBuses: number;
  busesInMaintenance: number;
  busesInBreakdown: number;
  driversAvailable: number;
  driversOnDuty: number;
  conductorsAvailable: number;
  conductorsOnDuty: number;
  flaggedSchedules: number;
  todaySchedules: Array<{
    _id: string;
    routeId: { routeName: string; startLocation: string; endLocation: string };
    departureTime: string;
    arrivalTime: string;
    status: string;
    flaggedForReassignment: boolean;
    busId: { busNumber: string } | null;
    driverId: { name: string } | null;
  }>;
  maintenanceDueAlerts: Array<{
    busNumber: string;
    registrationNumber: string;
    isDueSoon: boolean;
    isOverdue: boolean;
    nextServiceDue: string;
    daysUntilDue?: number;
    daysSinceDue?: number;
  }>;
}

export default function DepotDashboardPage() {
  const { data: stats, isLoading } = useQuery<DepotStats>({
    queryKey: ["depot-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/depot");
      return data.data;
    },
  });

  const now = new Date();

  const totalDrivers = (stats?.driversAvailable ?? 0) + (stats?.driversOnDuty ?? 0);
  const totalConductors = (stats?.conductorsAvailable ?? 0) + (stats?.conductorsOnDuty ?? 0);
  const todayCount = stats?.todaySchedules?.length ?? 0;
  const hasFlagged = (stats?.flaggedSchedules ?? 0) > 0;
  const hasMaintenanceAlerts = (stats?.maintenanceDueAlerts?.length ?? 0) > 0;
  const activeToday = stats?.todaySchedules?.filter(
    (s) => s.status === "scheduled" || s.status === "in_progress"
  ).length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Static hero shows immediately while data loads */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-md">
          <p className="text-emerald-200 text-sm font-medium mb-1">
            {format(now, "EEEE, MMMM d yyyy")}
          </p>
          <h1 className="text-2xl font-bold">Depot Dashboard</h1>
          <p className="text-emerald-200 text-sm mt-1">Today's fleet overview for your depot</p>
        </div>
        <PageLoader label="Fetching depot data…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-md">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-emerald-200 text-sm font-medium mb-1">
              {format(now, "EEEE, MMMM d yyyy")}
            </p>
            <h1 className="text-2xl font-bold">Depot Dashboard</h1>
            <p className="text-emerald-200 text-sm mt-1">Today's fleet overview for your depot</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-semibold">{activeToday} Active Today</span>
            </div>
            <p className="text-emerald-200 text-sm">{format(now, "HH:mm 'hrs'")}</p>
          </div>
        </div>

        {/* Quick summary pills */}
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { label: `${todayCount} Schedules`, icon: Calendar },
            { label: `${stats?.driversAvailable ?? 0} Drivers Free`, icon: UserCheck },
            { label: `${stats?.conductorsAvailable ?? 0} Conductors Free`, icon: UserCog },
            ...(hasFlagged
              ? [{ label: `${stats?.flaggedSchedules} Flagged`, icon: Flag }]
              : [{ label: "No flagged schedules", icon: CheckCircle2 }]),
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
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Idle Buses"
          value={stats?.idleBuses}
          sub="not deployed"
          icon={Bus}
          color="bg-amber-500"
          loading={false}
        />
        <StatCard
          title="Maintenance"
          value={stats?.busesInMaintenance}
          sub="buses in service"
          icon={Wrench}
          color="bg-blue-500"
          loading={false}
        />
        <StatCard
          title="Breakdown"
          value={stats?.busesInBreakdown}
          sub="needs attention"
          icon={AlertTriangle}
          color="bg-red-500"
          loading={false}
        />
        <StatCard
          title="Flagged"
          value={stats?.flaggedSchedules}
          sub="need reassignment"
          icon={Flag}
          color="bg-orange-500"
          loading={false}
        />
        <StatCard
          title="Drivers"
          value={`${stats?.driversAvailable ?? 0}/${totalDrivers}`}
          sub="available / total"
          icon={UserCheck}
          color="bg-teal-500"
          loading={false}
        />
        <StatCard
          title="Conductors"
          value={`${stats?.conductorsAvailable ?? 0}/${totalConductors}`}
          sub="available / total"
          icon={UserCog}
          color="bg-indigo-500"
          loading={false}
        />
      </div>

      {/* ── Alert Banners ── */}
      {hasFlagged && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3.5">
          <Flag className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800">
              {stats?.flaggedSchedules} Schedule{stats?.flaggedSchedules !== 1 ? "s" : ""} Flagged for Reassignment
            </p>
            <p className="text-sm text-orange-700 mt-0.5">
              Some schedules have missing resources.{" "}
              <Link href="/depot/schedules" className="underline font-medium">
                Go to Schedules →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Staff Availability + Maintenance Due ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Staff */}
        <SectionCard
          icon={Users}
          title="Staff Availability"
          subtitle={`${totalDrivers + totalConductors} total staff`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                Drivers ({totalDrivers})
              </p>
              <StatusBar
                label="available"
                count={stats?.driversAvailable ?? 0}
                total={totalDrivers}
                color="bg-emerald-500"
              />
              <StatusBar
                label="on duty"
                count={stats?.driversOnDuty ?? 0}
                total={totalDrivers}
                color="bg-blue-500"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                Conductors ({totalConductors})
              </p>
              <StatusBar
                label="available"
                count={stats?.conductorsAvailable ?? 0}
                total={totalConductors}
                color="bg-emerald-500"
              />
              <StatusBar
                label="on duty"
                count={stats?.conductorsOnDuty ?? 0}
                total={totalConductors}
                color="bg-blue-500"
              />
            </div>
          </div>
        </SectionCard>

        {/* Maintenance Due */}
        <SectionCard
          icon={Wrench}
          title="Maintenance Due"
          subtitle={`${stats?.maintenanceDueAlerts?.length ?? 0} buses flagged`}
          noPadding
        >
          {!hasMaintenanceAlerts ? (
            <EmptyState icon={CheckCircle2} message="All buses are up to date" />
          ) : (
            <div>
              {stats!.maintenanceDueAlerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors ${
                    i < stats!.maintenanceDueAlerts.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      a.isOverdue ? "bg-red-50" : "bg-amber-50"
                    }`}>
                      <Wrench className={`h-4 w-4 ${a.isOverdue ? "text-red-500" : "text-amber-500"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{a.busNumber}</p>
                      <p className="text-xs text-slate-400">{a.registrationNumber}</p>
                    </div>
                  </div>
                  {a.isOverdue ? (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full shrink-0">
                      Overdue {a.daysSinceDue}d
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                      Due in {a.daysUntilDue}d
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Today's Schedules ── */}
      <SectionCard
        icon={Clock}
        title="Today's Schedules"
        subtitle={`${todayCount} schedules`}
        action={
          <Link href="/depot/schedules">
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              View all →
            </Button>
          </Link>
        }
        noPadding
      >
        {!todayCount ? (
          <EmptyState icon={Calendar} message="No schedules for today" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  {["Route", "Departure", "Bus", "Driver", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats!.todaySchedules.map((s) => (
                  <tr
                    key={s._id}
                    className={`border-b last:border-0 transition-colors ${
                      s.flaggedForReassignment
                        ? "bg-orange-50/60 hover:bg-orange-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-700">{s.routeId?.routeName ?? "—"}</p>
                        {s.flaggedForReassignment && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 shrink-0">
                            <Flag className="h-2.5 w-2.5" /> Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {s.routeId?.startLocation} → {s.routeId?.endLocation}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 tabular-nums whitespace-nowrap">
                      {s.departureTime}
                      <span className="text-slate-400"> → </span>
                      {s.arrivalTime}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.busId?.busNumber ?? (
                        <span className="text-orange-500 text-xs font-medium">No bus</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {s.driverId?.name ?? (
                        <span className="text-orange-500 text-xs font-medium">No driver</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

    </div>
  );
}
