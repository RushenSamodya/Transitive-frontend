"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSchedules, Schedule, useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { useBuses } from "@/hooks/useBuses";
import { useDrivers } from "@/hooks/useDrivers";
import { useConductors } from "@/hooks/useConductors";
import { useRoutes } from "@/hooks/useRoutes";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, Flag, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const scheduleSchema = z.object({
  routeId: z.string().min(1, "Route is required"),
  busId: z.string().min(1, "Bus is required"),
  driverId: z.string().min(1, "Driver is required"),
  conductorId: z.string().min(1, "Conductor is required"),
  date: z.string().min(1, "Date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  tripsTotal: z.coerce.number().min(1),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

function ConflictAlert({ conflicts }: { conflicts: string[] }) {
  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Scheduling Conflict</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 space-y-1">
          {conflicts.map((msg, i) => (
            <li key={i} className="text-red-700 text-sm">• {msg}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export default function DepotSchedulesPage() {
  const { data: schedules, isLoading } = useSchedules();
  const { data: buses } = useBuses();
  const { data: drivers } = useDrivers();
  const { data: conductors } = useConductors();
  const { data: routes } = useRoutes();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [reassigning, setReassigning] = useState<Schedule | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<ScheduleFormData>({ resolver: zodResolver(scheduleSchema) as any });

  const flaggedSchedules = schedules?.filter((s) => s.flaggedForReassignment) ?? [];

  const openCreate = () => {
    setEditing(null);
    setConflicts([]);
    reset({ routeId: "", busId: "", driverId: "", conductorId: "", date: "", departureTime: "", arrivalTime: "", tripsTotal: 1 });
    setDialogOpen(true);
  };

  const openEdit = (schedule: Schedule) => {
    setEditing(schedule);
    setConflicts([]);
    reset({
      routeId: schedule.routeId?._id ?? "",
      busId: schedule.busId?._id ?? "",
      driverId: schedule.driverId?._id ?? "",
      conductorId: schedule.conductorId?._id ?? "",
      date: schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : "",
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      tripsTotal: schedule.tripsTotal,
    });
    setDialogOpen(true);
  };

  const openReassign = (schedule: Schedule) => {
    setReassigning(schedule);
    setEditing(schedule);
    setConflicts([]);
    reset({
      routeId: schedule.routeId?._id ?? "",
      busId: "",
      driverId: "",
      conductorId: "",
      date: schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : "",
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      tripsTotal: schedule.tripsTotal,
    });
    setDialogOpen(true);
  };

  const parseConflictError = (err: any): string[] => {
    const data = err?.response?.data;
    if (data?.conflicts && Array.isArray(data.conflicts)) return data.conflicts as string[];
    if (data?.message) return [data.message];
    return ["A scheduling conflict occurred"];
  };

  const onSubmit = async (values: ScheduleFormData) => {
    setConflicts([]);
    try {
      if (editing) {
        await updateSchedule.mutateAsync({ id: editing._id, ...values });
        toast({ title: reassigning ? "Schedule reassigned" : "Schedule updated" });
      } else {
        await createSchedule.mutateAsync(values as any);
        toast({ title: "Schedule created" });
      }
      setDialogOpen(false);
      setReassigning(null);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setConflicts(parseConflictError(err));
      } else {
        toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSchedule.mutateAsync(deleteTarget._id);
      toast({ title: "Schedule deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete schedule", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const availableBuses = buses?.filter((b) => b.status === "active") ?? [];
  const availableDrivers = drivers?.filter((d) => d.availability === "available") ?? [];
  const availableConductors = conductors?.filter((c) => c.availability === "available") ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Schedules"
        description="Manage bus schedules for your depot"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> New Schedule
          </Button>
        }
      />

      {/* Flagged banner */}
      {flaggedSchedules.length > 0 && (
        <Alert className="border-orange-400 bg-orange-50">
          <Flag className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 font-semibold">
            {flaggedSchedules.length} schedule{flaggedSchedules.length > 1 ? "s" : ""} need reassignment
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            The rows highlighted in orange below have missing resources. Click the reassign button to fix them.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : schedules?.map((s) => (
                  <TableRow
                    key={s._id}
                    className={s.flaggedForReassignment ? "bg-orange-50 border-l-4 border-l-orange-400" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {s.flaggedForReassignment && <Flag className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
                        <span className="font-medium">{s.routeId?.routeName}</span>
                      </div>
                      <p className="text-xs text-gray-500">{s.routeId?.startLocation} → {s.routeId?.endLocation}</p>
                    </TableCell>
                    <TableCell>{s.date ? format(new Date(s.date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell className="text-sm">{s.departureTime} – {s.arrivalTime}</TableCell>
                    <TableCell>
                      {s.busId?.number ?? <span className="text-red-500 font-medium text-xs">Missing</span>}
                    </TableCell>
                    <TableCell>
                      {s.driverId?.name ?? <span className="text-red-500 font-medium text-xs">Missing</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{s.tripsDone}/{s.tripsTotal}</span>
                      <p className="text-xs text-gray-500">{s.tripsRemaining} remaining</p>
                    </TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.flaggedForReassignment && (
                          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs" onClick={() => openReassign(s)}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Reassign
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit/Reassign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setConflicts([]); setReassigning(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reassigning ? "Reassign Schedule" : editing ? "Edit Schedule" : "New Schedule"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {conflicts.length > 0 && <ConflictAlert conflicts={conflicts} />}

            <div className="space-y-1.5">
              <Label>Route</Label>
              <Select
                defaultValue={editing?.routeId?._id ?? ""}
                onValueChange={(v) => setValue("routeId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>
                  {routes?.map((r) => (
                    <SelectItem key={r._id} value={r._id}>{r.routeName} ({r.startLocation} → {r.endLocation})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.routeId && <p className="text-xs text-red-600">{errors.routeId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Departure Time</Label>
                <Input type="time" {...register("departureTime")} />
                {errors.departureTime && <p className="text-xs text-red-600">{errors.departureTime.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Arrival Time</Label>
                <Input type="time" {...register("arrivalTime")} />
                {errors.arrivalTime && <p className="text-xs text-red-600">{errors.arrivalTime.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Bus <span className="text-gray-400 font-normal">(active buses only)</span></Label>
              <Select
                defaultValue={reassigning ? "" : editing?.busId?._id ?? ""}
                onValueChange={(v) => setValue("busId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                <SelectContent>
                  {availableBuses.map((b) => (
                    <SelectItem key={b._id} value={b._id}>{b.number} — {b.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.busId && <p className="text-xs text-red-600">{errors.busId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Driver <span className="text-gray-400 font-normal">(available drivers only)</span></Label>
              <Select
                defaultValue={reassigning ? "" : editing?.driverId?._id ?? ""}
                onValueChange={(v) => setValue("driverId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {availableDrivers.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.driverId && <p className="text-xs text-red-600">{errors.driverId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Conductor <span className="text-gray-400 font-normal">(available conductors only)</span></Label>
              <Select
                defaultValue={reassigning ? "" : editing?.conductorId?._id ?? ""}
                onValueChange={(v) => setValue("conductorId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select conductor" /></SelectTrigger>
                <SelectContent>
                  {availableConductors.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.conductorId && <p className="text-xs text-red-600">{errors.conductorId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Total Trips</Label>
              <Input type="number" min={1} {...register("tripsTotal")} />
              {errors.tripsTotal && <p className="text-xs text-red-600">{errors.tripsTotal.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : reassigning ? "Reassign" : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule?"
        onConfirm={confirmDelete}
        loading={deleteSchedule.isPending}
      />
    </div>
  );
}
