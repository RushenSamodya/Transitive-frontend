"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRoutes, Route, useCreateRoute, useUpdateRoute, useDeleteRoute } from "@/hooks/useRoutes";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const routeSchema = z.object({
  routeName: z.string().min(1, "Route name is required"),
  startLocation: z.string().min(1, "Start location is required"),
  endLocation: z.string().min(1, "End location is required"),
  distanceKm: z.coerce.number().min(0.1, "Distance must be positive"),
  estimatedDuration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
});

type RouteFormData = z.infer<typeof routeSchema>;

export default function AdminRoutesPage() {
  const { data: routes, isLoading } = useRoutes();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<RouteFormData>({ resolver: zodResolver(routeSchema) as any });

  const openCreate = () => {
    setEditing(null);
    reset({ routeName: "", startLocation: "", endLocation: "", distanceKm: 0, estimatedDuration: 0 });
    setDialogOpen(true);
  };

  const openEdit = (route: Route) => {
    setEditing(route);
    reset({
      routeName: route.routeName,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      distanceKm: route.distanceKm,
      estimatedDuration: route.estimatedDuration,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: RouteFormData) => {
    try {
      if (editing) {
        await updateRoute.mutateAsync({ id: editing._id, ...values });
        toast({ title: "Route updated" });
      } else {
        await createRoute.mutateAsync(values);
        toast({ title: "Route created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoute.mutateAsync(deleteTarget._id);
      toast({ title: "Route deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete route", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Routes"
        description="Manage SLTB bus routes"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add Route
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Route Name</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>Est. Duration</TableHead>
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
              : routes?.map((route) => (
                  <TableRow key={route._id}>
                    <TableCell className="font-medium">{route.routeName}</TableCell>
                    <TableCell>{route.startLocation}</TableCell>
                    <TableCell>{route.endLocation}</TableCell>
                    <TableCell>{route.distanceKm} km</TableCell>
                    <TableCell>{route.estimatedDuration} min</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(route)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(route)}>
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
            <DialogTitle>{editing ? "Edit Route" : "Add Route"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Route Name</Label>
              <Input {...register("routeName")} placeholder="Route 138" />
              {errors.routeName && <p className="text-xs text-red-600">{errors.routeName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Location</Label>
                <Input {...register("startLocation")} placeholder="Colombo" />
                {errors.startLocation && <p className="text-xs text-red-600">{errors.startLocation.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>End Location</Label>
                <Input {...register("endLocation")} placeholder="Galle" />
                {errors.endLocation && <p className="text-xs text-red-600">{errors.endLocation.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Distance (km)</Label>
                <Input type="number" step="0.1" {...register("distanceKm")} />
                {errors.distanceKm && <p className="text-xs text-red-600">{errors.distanceKm.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Duration (minutes)</Label>
                <Input type="number" {...register("estimatedDuration")} />
                {errors.estimatedDuration && <p className="text-xs text-red-600">{errors.estimatedDuration.message}</p>}
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
        title="Delete Route"
        description={`Are you sure you want to delete "${deleteTarget?.routeName}"?`}
        onConfirm={confirmDelete}
        loading={deleteRoute.isPending}
      />
    </div>
  );
}
