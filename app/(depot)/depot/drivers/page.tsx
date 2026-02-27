"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDrivers, Driver, useCreateDriver, useUpdateDriver, useDeleteDriver } from "@/hooks/useDrivers";
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
import { format, differenceInDays } from "date-fns";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry is required"),
  contactNumber: z.string().min(1, "Phone is required"),
  availability: z.enum(["available", "on_duty", "off", "leave"]),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function DepotDriversPage() {
  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<DriverFormData>({ resolver: zodResolver(driverSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", licenseNumber: "", licenseExpiry: "", contactNumber: "", availability: "available" });
    setDialogOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    reset({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: new Date(driver.licenseExpiry).toISOString().split("T")[0],
      contactNumber: driver.contactNumber,
      availability: driver.availability,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: DriverFormData) => {
    try {
      if (editing) {
        await updateDriver.mutateAsync({ id: editing._id, ...values });
        toast({ title: "Driver updated" });
      } else {
        await createDriver.mutateAsync(values);
        toast({ title: "Driver added" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDriver.mutateAsync(deleteTarget._id);
      toast({ title: "Driver deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete driver", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const isExpiringIn30Days = (expiry: string) => {
    const days = differenceInDays(new Date(expiry), new Date());
    return days >= 0 && days <= 30;
  };

  const isExpired = (expiry: string) => differenceInDays(new Date(expiry), new Date()) < 0;

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Manage depot drivers"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Driver
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>License Expiry</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Availability</TableHead>
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
              : drivers?.map((driver) => {
                  const expired = isExpired(driver.licenseExpiry);
                  const expiringSoon = isExpiringIn30Days(driver.licenseExpiry);
                  return (
                    <TableRow key={driver._id} className={expired ? "bg-red-50" : expiringSoon ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {format(new Date(driver.licenseExpiry), "dd MMM yyyy")}
                          {expired && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              <AlertTriangle className="h-3 w-3" /> Expired
                            </span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3" /> Expiring Soon
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{driver.contactNumber}</TableCell>
                      <TableCell><StatusBadge status={driver.availability} /></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(driver)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(driver)}>
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
            <DialogTitle>{editing ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="K. Perera" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>License Number</Label>
                <Input {...register("licenseNumber")} placeholder="B1234567" />
                {errors.licenseNumber && <p className="text-xs text-red-600">{errors.licenseNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>License Expiry</Label>
                <Input type="date" {...register("licenseExpiry")} />
                {errors.licenseExpiry && <p className="text-xs text-red-600">{errors.licenseExpiry.message}</p>}
              </div>
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
                  onValueChange={(v) => setValue("availability", v as DriverFormData["availability"])}
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
        title="Delete Driver"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={confirmDelete}
        loading={deleteDriver.isPending}
      />
    </div>
  );
}
