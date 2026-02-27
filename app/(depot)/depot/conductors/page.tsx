"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useConductors, Conductor, useCreateConductor, useUpdateConductor, useDeleteConductor } from "@/hooks/useConductors";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const conductorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactNumber: z.string().min(1, "Phone is required"),
  availability: z.enum(["available", "on_duty", "off", "leave"]),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

export default function DepotConductorsPage() {
  const { data: conductors, isLoading } = useConductors();
  const createConductor = useCreateConductor();
  const updateConductor = useUpdateConductor();
  const deleteConductor = useDeleteConductor();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Conductor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conductor | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<ConductorFormData>({ resolver: zodResolver(conductorSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", contactNumber: "", availability: "available" });
    setDialogOpen(true);
  };

  const openEdit = (conductor: Conductor) => {
    setEditing(conductor);
    reset({
      name: conductor.name,
      contactNumber: conductor.contactNumber,
      availability: conductor.availability,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: ConductorFormData) => {
    try {
      if (editing) {
        await updateConductor.mutateAsync({ id: editing._id, ...values });
        toast({ title: "Conductor updated" });
      } else {
        await createConductor.mutateAsync(values);
        toast({ title: "Conductor added" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConductor.mutateAsync(deleteTarget._id);
      toast({ title: "Conductor deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete conductor", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Conductors"
        description="Manage depot conductors"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Conductor
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : conductors?.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.contactNumber}</TableCell>
                    <TableCell><StatusBadge status={c.availability} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Conductor" : "Add Conductor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="A. Silva" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register("contactNumber")} placeholder="0771234567" />
                {errors.contactNumber && <p className="text-xs text-red-600">{errors.contactNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select
                  defaultValue={editing?.availability ?? "available"}
                  onValueChange={(v) => setValue("availability", v as ConductorFormData["availability"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="on_duty">On Duty</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Saving..." : editing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Conductor"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={confirmDelete}
        loading={deleteConductor.isPending}
      />
    </div>
  );
}
