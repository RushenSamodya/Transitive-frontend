"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBuses, Bus, useCreateBus, useUpdateBus, useDeleteBus } from "@/hooks/useBuses";
import { useMaintenanceDue } from "@/hooks/useMaintenance";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const busSchema = z.object({
  number: z.string().min(1, "Bus number is required"),
  model: z.string().min(1, "Model is required"),
  mileage: z.coerce.number().min(0),
  dailyFuelConsumption: z.coerce.number().min(0),
  dailyRevenue: z.coerce.number().min(0),
  maintenanceCost: z.coerce.number().min(0),
  status: z.enum(["active", "inactive", "maintenance", "breakdown"]),
  nextServiceDue: z.string().optional(),
});

type BusFormData = z.infer<typeof busSchema>;

export default function DepotBusesPage() {
  const { data: buses, isLoading } = useBuses();
  const { data: maintenanceDue } = useMaintenanceDue();
  const createBus = useCreateBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bus | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<BusFormData>({ resolver: zodResolver(busSchema) as any });

  // Build a lookup for maintenance due status
  const dueMap = new Map(maintenanceDue?.map((d) => [d.busId, d]));

  const openCreate = () => {
    setEditing(null);
    reset({ number: "", model: "", mileage: 0, dailyFuelConsumption: 0, dailyRevenue: 0, maintenanceCost: 0, status: "active", nextServiceDue: "" });
    setDialogOpen(true);
  };

  const openEdit = (bus: Bus) => {
    setEditing(bus);
    reset({
      number: bus.number,
      model: bus.model,
      mileage: bus.mileage,
      dailyFuelConsumption: bus.dailyFuelConsumption,
      dailyRevenue: bus.dailyRevenue,
      maintenanceCost: bus.maintenanceCost,
      status: bus.status,
      nextServiceDue: bus.nextServiceDue
        ? new Date(bus.nextServiceDue).toISOString().split("T")[0]
        : "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: BusFormData) => {
    try {
      const payload = { ...values, nextServiceDue: values.nextServiceDue || undefined };
      if (editing) {
        await updateBus.mutateAsync({ id: editing._id, ...payload });
        toast({ title: "Bus updated" });
      } else {
        await createBus.mutateAsync(payload);
        toast({ title: "Bus created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBus.mutateAsync(deleteTarget._id);
      toast({ title: "Bus deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete bus", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Buses"
        description="Manage your depot's fleet"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Bus
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Bus Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Service</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : buses?.map((bus) => {
                  const due = dueMap.get(bus._id);
                  return (
                    <TableRow key={bus._id} className={due?.isOverdue ? "bg-red-50" : due?.isDueSoon ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium">{bus.number}</TableCell>
                      <TableCell>{bus.model}</TableCell>
                      <TableCell>{bus.mileage.toLocaleString()} km</TableCell>
                      <TableCell><StatusBadge status={bus.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {bus.nextServiceDue
                            ? format(new Date(bus.nextServiceDue), "dd MMM yyyy")
                            : <span className="text-gray-400">—</span>}
                          {due?.isOverdue && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              <AlertTriangle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                          {due?.isDueSoon && !due.isOverdue && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3" /> Due Soon
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(bus)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(bus)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Bus" : "Add Bus"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Bus Number</Label>
                <Input {...register("number")} placeholder="NB-1234" />
                {errors.number && <p className="text-xs text-red-600">{errors.number.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Input {...register("model")} placeholder="Ashok Leyland Viking" />
                {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mileage (km)</Label>
                <Input type="number" {...register("mileage")} />
                {errors.mileage && <p className="text-xs text-red-600">{errors.mileage.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Daily Fuel (L)</Label>
                <Input type="number" {...register("dailyFuelConsumption")} />
                {errors.dailyFuelConsumption && <p className="text-xs text-red-600">{errors.dailyFuelConsumption.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Daily Revenue (Rs.)</Label>
                <Input type="number" {...register("dailyRevenue")} />
                {errors.dailyRevenue && <p className="text-xs text-red-600">{errors.dailyRevenue.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Maintenance Cost (Rs.)</Label>
                <Input type="number" {...register("maintenanceCost")} />
                {errors.maintenanceCost && <p className="text-xs text-red-600">{errors.maintenanceCost.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  defaultValue={editing?.status ?? "active"}
                  onValueChange={(v) => setValue("status", v as BusFormData["status"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Next Service Due (optional)</Label>
                <Input type="date" {...register("nextServiceDue")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Bus"
        description={`Are you sure you want to delete bus "${deleteTarget?.number}"?`}
        onConfirm={confirmDelete}
        loading={deleteBus.isPending}
      />
    </div>
  );
}
