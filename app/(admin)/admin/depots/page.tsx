"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDepots, Depot, useCreateDepot, useUpdateDepot, useDeleteDepot } from "@/hooks/useDepots";
import { useUsers } from "@/hooks/useUsers";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const depotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  managerId: z.string().optional(),
});

type DepotFormData = z.infer<typeof depotSchema>;

export default function AdminDepotsPage() {
  const { data: depots, isLoading } = useDepots();
  const { data: users } = useUsers();
  const createDepot = useCreateDepot();
  const updateDepot = useUpdateDepot();
  const deleteDepot = useDeleteDepot();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Depot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Depot | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<DepotFormData>({ resolver: zodResolver(depotSchema) });

  const managers = users?.filter((u) => u.role === "depot_manager") ?? [];

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", location: "", city: "", contactNumber: "", managerId: "" });
    setDialogOpen(true);
  };

  const openEdit = (depot: Depot) => {
    setEditing(depot);
    reset({
      name: depot.name,
      location: depot.location,
      city: depot.city,
      contactNumber: depot.contactNumber,
      managerId: typeof depot.managerId === "object" ? depot.managerId?._id : depot.managerId ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: DepotFormData) => {
    try {
      const payload = { ...values, managerId: values.managerId || undefined };
      if (editing) {
        await updateDepot.mutateAsync({ id: editing._id, ...payload });
        toast({ title: "Depot updated" });
      } else {
        await createDepot.mutateAsync(payload);
        toast({ title: "Depot created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepot.mutateAsync(deleteTarget._id);
      toast({ title: "Depot deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete depot", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Depots"
        description="Manage SLTB depots and their managers"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Depot
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : depots?.map((depot) => (
                  <TableRow key={depot._id}>
                    <TableCell className="font-medium">{depot.name}</TableCell>
                    <TableCell>{depot.location}</TableCell>
                    <TableCell>{depot.city}</TableCell>
                    <TableCell>{depot.contactNumber}</TableCell>
                    <TableCell>
                      {depot.managerId
                        ? typeof depot.managerId === "object"
                          ? depot.managerId.name
                          : depot.managerId
                        : <span className="text-gray-400 italic">Unassigned</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(depot)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(depot)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>{editing ? "Edit Depot" : "Add Depot"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Colombo Central Depot" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input {...register("location")} placeholder="Colombo 10" />
                {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input {...register("city")} placeholder="Colombo" />
                {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contact Number</Label>
              <Input {...register("contactNumber")} placeholder="0112345678" />
              {errors.contactNumber && <p className="text-xs text-red-600">{errors.contactNumber.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Assign Manager (optional)</Label>
              <Select
                defaultValue={editing?.managerId ? (typeof editing.managerId === "object" ? editing.managerId._id : editing.managerId) : "none"}
                onValueChange={(v) => setValue("managerId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager</SelectItem>
                  {managers.map((m) => (
                    <SelectItem key={m._id} value={m._id}>{m.name} — {m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        title="Delete Depot"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        loading={deleteDepot.isPending}
      />
    </div>
  );
}
