"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bus, Users, AlertTriangle, Wrench, Flag } from "lucide-react";
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

function StatCard({ title, value, icon: Icon, color, sub, loading }: {
  title: string;
  value?: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : (
          <>
            <p className="text-3xl font-bold">{value ?? 0}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DepotDashboardPage() {
  const { data: stats, isLoading } = useQuery<DepotStats>({
    queryKey: ["depot-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/depot");
      return data.data;
    },
  });

  const hasFlagged = (stats?.flaggedSchedules ?? 0) > 0;
  const hasMaintenanceAlerts = (stats?.maintenanceDueAlerts?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Depot Dashboard" description="Today's fleet overview for your depot" />

      {/* Flagged Schedule Warning */}
      {hasFlagged && (
        <Alert className="border-orange-400 bg-orange-50">
          <Flag className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 font-semibold">
            {stats?.flaggedSchedules} Schedule{stats?.flaggedSchedules !== 1 ? "s" : ""} Flagged for Reassignment
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Some schedules have missing resources. Go to{" "}
            <Link href="/depot/schedules" className="underline font-medium">Schedules</Link>{" "}
            to reassign them.
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Alerts */}
      {hasMaintenanceAlerts && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <Wrench className="h-4 w-4 text-yellow-700" />
          <AlertTitle className="text-yellow-800 font-semibold">Maintenance Alerts</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <ul className="mt-1 space-y-1">
              {stats?.maintenanceDueAlerts.map((a, i) => (
                <li key={i}>
                  <span className="font-medium">{a.busNumber}</span> ({a.registrationNumber}) —{" "}
                  {a.isOverdue
                    ? <span className="text-red-700 font-semibold">Overdue by {a.daysSinceDue} day(s)</span>
                    : <span>Due in {a.daysUntilDue} day(s) ({format(new Date(a.nextServiceDue), "dd MMM yyyy")})</span>
                  }
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Idle Buses" value={stats?.idleBuses} icon={Bus} color="bg-yellow-500" loading={isLoading} />
        <StatCard title="In Maintenance" value={stats?.busesInMaintenance} icon={Wrench} color="bg-blue-500" loading={isLoading} />
        <StatCard title="Breakdown" value={stats?.busesInBreakdown} icon={AlertTriangle} color="bg-red-500" loading={isLoading} />
        <StatCard title="Flagged Schedules" value={stats?.flaggedSchedules} icon={Flag} color="bg-orange-500" loading={isLoading} />
        <StatCard
          title="Drivers"
          value={`${stats?.driversAvailable ?? 0} / ${(stats?.driversAvailable ?? 0) + (stats?.driversOnDuty ?? 0)}`}
          icon={Users}
          color="bg-green-500"
          sub="Available / Total active"
          loading={isLoading}
        />
        <StatCard
          title="Conductors"
          value={`${stats?.conductorsAvailable ?? 0} / ${(stats?.conductorsAvailable ?? 0) + (stats?.conductorsOnDuty ?? 0)}`}
          icon={Users}
          color="bg-indigo-500"
          sub="Available / Total active"
          loading={isLoading}
        />
      </div>

      {/* Today's Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Today&apos;s Schedules</CardTitle>
          <Link href="/depot/schedules">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !stats?.todaySchedules?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">No schedules for today</p>
          ) : (
            <div className="space-y-2">
              {stats.todaySchedules.map((s) => (
                <div
                  key={s._id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    s.flaggedForReassignment ? "border-orange-300 bg-orange-50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.routeId?.routeName}</p>
                      {s.flaggedForReassignment && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          <Flag className="h-3 w-3 mr-1" /> Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {s.departureTime} → {s.arrivalTime} · {s.busId?.busNumber ?? "No bus"} · {s.driverId?.name ?? "No driver"}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
