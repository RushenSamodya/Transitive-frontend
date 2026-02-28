import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value?: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
  /**
   * "accent" – admin style: coloured top bar + floating icon chip (default)
   * "plain"  – depot style: flat card, icon in top-right corner
   */
  variant?: "accent" | "plain";
}

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  loading,
  variant = "accent",
}: StatCardProps) {
  if (variant === "plain") {
    return (
      <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 leading-tight">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg shrink-0 ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className="text-3xl font-bold">{value ?? 0}</p>
              {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // accent variant (admin style)
  // Icon chip is absolutely positioned so it never competes with the title
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`h-1 ${color}`} />
      {/* Floating icon chip — top-right, independent of title width */}
      <div className={`absolute top-4 right-3 p-2 rounded-xl ${color} shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <CardContent className="pt-4 pb-5 pr-12">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 leading-tight">
          {title}
        </span>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-slate-900">{value ?? 0}</p>
            {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
