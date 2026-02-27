"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Bus, Calendar, AlertTriangle } from "lucide-react";

interface AdminStats {
  totalDepots: number;
  totalBuses: number;
  idleBuses: number;
  activeSchedulesToday: number;
}

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
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/admin");
      return data.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        description="SLTB fleet overview across all depots"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Depots"
          value={stats?.totalDepots}
          icon={Building2}
          color="bg-indigo-500"
          loading={isLoading}
        />
        <StatCard
          title="Total Buses"
          value={stats?.totalBuses}
          icon={Bus}
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatCard
          title="Idle Buses Today"
          value={stats?.idleBuses}
          icon={AlertTriangle}
          color="bg-yellow-500"
          loading={isLoading}
        />
        <StatCard
          title="Active Schedules Today"
          value={stats?.activeSchedulesToday}
          icon={Calendar}
          color="bg-green-500"
          loading={isLoading}
        />
      </div>
    </div>
  );
}
