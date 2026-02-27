"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMaintenance,
  useMaintenanceDue,
  MaintenanceRecord,
  useCreateMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
} from "@/hooks/useMaintenance";
import { useBuses } from "@/hooks/useBuses";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, Wrench, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Use string for cost in the form and convert to number on submit (avoids Zod v4 coerce type issues)
const maintenanceSchema = z.object({
  busId: z.string().min(1, "Bus is required"),
  type: z.enum(["routine", "repair", "breakdown"]),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  cost: z.string().optional(),
});

const completeSchema = z.object({
  completedDate: z.string().min(1, "Completed date is required"),
  cost: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
type CompleteFormData = z.infer<typeof completeSchema>;

const parseCost = (v?: string): number | undefined => {
  if (!v || v.trim() === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

export default function DepotMaintenancePage() {
  const { data: records, isLoading } = useMaintenance();
  const { data: dueAlerts } = useMaintenanceDue();
  const { data: buses } = useBuses();
  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [completing, setCompleting] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<MaintenanceFormData>({ resolver: zodResolver(maintenanceSchema) });

  const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete, formState: { errors: errorsComplete, isSubmitting: isSubmittingComplete } } =
    useForm<CompleteFormData>({ resolver: zodResolver(completeSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ busId: "", type: "routine", description: "", scheduledDate: "", cost: "" });
    setDialogOpen(true);
  };

  const openEdit = (record: MaintenanceRecord) => {
    setEditing(record);
    reset({
      busId: typeof record.busId === "object" ? record.busId._id : record.busId,
      type: record.type,
      description: record.description,
      scheduledDate: new Date(record.scheduledDate).toISOString().split("T")[0],
      cost: record.cost != null ? String(record.cost) : "",
    });
    setDialogOpen(true);
  };

  const openComplete = (record: MaintenanceRecord) => {
    setCompleting(record);
    resetComplete({
      completedDate: new Date().toISOString().split("T")[0],
      cost: record.cost != null ? String(record.cost) : "",
    });
    setCompleteDialogOpen(true);
  };

  const onSubmit = async (values: MaintenanceFormData) => {
    try {
      const payload = { ...values, cost: parseCost(values.cost) };
      if (editing) {
        await updateMaintenance.mutateAsync({ id: editing._id, ...payload });
        toast({ title: "Record updated" });
      } else {
        await createMaintenance.mutateAsync({ ...payload, busId: values.busId });
        toast({ title: "Maintenance record created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const onComplete = async (values: CompleteFormData) => {
    if (!completing) return;
    try {
      await updateMaintenance.mutateAsync({
        id: completing._id,
        status: "completed",
        completedDate: values.completedDate,
        cost: parseCost(values.cost),
      });
      toast({ title: "Maintenance marked as completed" });
      setCompleteDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Failed to complete", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMaintenance.mutateAsync(deleteTarget._id);
      toast({ title: "Record deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const typeLabel: Record<string, string> = { routine: "Routine", repair: "Repair", breakdown: "Breakdown" };
  const hasAlerts = (dueAlerts?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance"
        description="Track and manage bus maintenance"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Log Maintenance
          </Button>
        }
      />

      {/* Due Alerts */}
      {hasAlerts && (
        <Alert className="border-yellow-400 bg-yellow-50">
          <Wrench className="h-4 w-4 text-yellow-700" />
          <AlertTitle className="text-yellow-800 font-semibold">Maintenance Due Alerts</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-1">
              {dueAlerts?.map((a, i) => (
                <li key={i} className="text-yellow-800 text-sm">
                  <span className="font-medium">{a.number}</span> ({a.model}) —{" "}
                  {a.isOverdue
                    ? <span className="text-red-700 font-semibold">Overdue by {a.daysSinceDue} day(s)</span>
                    : <span>Due in {a.daysUntilDue} day(s)</span>
                  }
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Bus</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Cost</TableHead>
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
              : records?.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">
                      {typeof r.busId === "object" ? r.busId.number : r.busId}
                      {typeof r.busId === "object" && (
                        <p className="text-xs text-gray-500">{r.busId.model}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        r.type === "breakdown" ? "bg-red-100 text-red-700" :
                        r.type === "repair" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {typeLabel[r.type]}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{r.description}</TableCell>
                    <TableCell>{format(new Date(r.scheduledDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {r.completedDate
                        ? format(new Date(r.completedDate), "dd MMM yyyy")
                        : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      {r.cost != null ? `LKR ${r.cost.toLocaleString()}` : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50 text-xs"
                            onClick={() => openComplete(r)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(r)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Maintenance Record" : "Log Maintenance"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Bus</Label>
              <Select
                defaultValue={editing ? (typeof editing.busId === "object" ? editing.busId._id : editing.busId) : ""}
                onValueChange={(v) => setValue("busId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                <SelectContent>
                  {buses?.map((b) => (
                    <SelectItem key={b._id} value={b._id}>{b.number} — {b.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.busId && <p className="text-xs text-red-600">{errors.busId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  defaultValue={editing?.type ?? "routine"}
                  onValueChange={(v) => setValue("type", v as MaintenanceFormData["type"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scheduled Date</Label>
                <Input type="date" {...register("scheduledDate")} />
                {errors.scheduledDate && <p className="text-xs text-red-600">{errors.scheduledDate.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Oil change, brake inspection..." rows={3} />
              {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Estimated Cost (LKR, optional)</Label>
              <Input type="number" {...register("cost")} placeholder="15000" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : editing ? "Update" : "Log"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Completed</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitComplete(onComplete)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Completion Date</Label>
              <Input type="date" {...registerComplete("completedDate")} />
              {errorsComplete.completedDate && <p className="text-xs text-red-600">{errorsComplete.completedDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Actual Cost (LKR, optional)</Label>
              <Input type="number" {...registerComplete("cost")} placeholder="15000" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmittingComplete} className="bg-green-600 hover:bg-green-700">
                {isSubmittingComplete ? "Saving..." : "Mark Complete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Maintenance Record"
        description="Are you sure you want to delete this maintenance record?"
        onConfirm={confirmDelete}
        loading={deleteMaintenance.isPending}
      />
    </div>
  );
}
