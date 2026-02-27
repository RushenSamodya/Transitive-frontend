"use client";

import { useDepots } from "@/hooks/useDepots";
import { useBuses } from "@/hooks/useBuses";
import { useSchedules } from "@/hooks/useSchedules";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Bus, Calendar, AlertTriangle } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  color: string;
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
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: depots, isLoading: loadingDepots } = useDepots();
  const { data: buses, isLoading: loadingBuses } = useBuses();
  const { data: schedules, isLoading: loadingSchedules } = useSchedules();

  const isLoading = loadingDepots || loadingBuses || loadingSchedules;

  const totalDepots = depots?.length ?? 0;
  const totalBuses = buses?.length ?? 0;
  const idleBuses = buses?.filter((b) => b.status !== "active").length ?? 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const activeSchedulesToday =
    schedules?.filter((s) => {
      const scheduleDate = s.date ? new Date(s.date).toISOString().split("T")[0] : null;
      return scheduleDate === todayStr && (s.status === "scheduled" || s.status === "in_progress");
    }).length ?? 0;

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        description="SLTB fleet overview across all depots"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Depots"
          value={totalDepots}
          icon={Building2}
          color="bg-indigo-500"
          loading={isLoading}
        />
        <StatCard
          title="Total Buses"
          value={totalBuses}
          icon={Bus}
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatCard
          title="Inactive / In Maintenance"
          value={idleBuses}
          icon={AlertTriangle}
          color="bg-yellow-500"
          loading={isLoading}
        />
        <StatCard
          title="Active Schedules Today"
          value={activeSchedulesToday}
          icon={Calendar}
          color="bg-green-500"
          loading={isLoading}
        />
      </div>
    </div>
  );
}
