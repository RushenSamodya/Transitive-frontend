type BusStatus = "active" | "inactive" | "maintenance" | "breakdown";
type PersonStatus = "available" | "on_duty" | "off" | "leave";
type ScheduleStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

type StatusType = BusStatus | PersonStatus | ScheduleStatus | MaintenanceStatus;

const variantMap: Record<StatusType, string> = {
  // Bus
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
  maintenance: "bg-blue-100 text-blue-800 border-blue-200",
  breakdown: "bg-red-100 text-red-800 border-red-200",
  // Person
  available: "bg-green-100 text-green-800 border-green-200",
  on_duty: "bg-blue-100 text-blue-800 border-blue-200",
  off: "bg-gray-100 text-gray-700 border-gray-200",
  leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
  // Schedule
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const labelMap: Record<StatusType, string> = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
  breakdown: "Breakdown",
  available: "Available",
  on_duty: "On Duty",
  off: "Off",
  leave: "On Leave",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = variantMap[status as StatusType] ?? "bg-gray-100 text-gray-700";
  const label = labelMap[status as StatusType] ?? status;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}
