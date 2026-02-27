"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsers, User, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useDepots } from "@/hooks/useDepots";
import { PageHeader } from "@/components/shared/PageHeader";
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

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "depot_manager"]),
  depotId: z.string().optional(),
});

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  role: z.enum(["admin", "depot_manager"]),
  depotId: z.string().optional(),
});

type CreateUserData = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
  const { data: users, isLoading } = useUsers();
  const { data: depots } = useDepots();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "depot_manager">("depot_manager");

  const schema = editing ? editUserSchema : createUserSchema;
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateUserData>({ resolver: zodResolver(schema as any) });

  const openCreate = () => {
    setEditing(null);
    setSelectedRole("depot_manager");
    reset({ name: "", email: "", password: "", role: "depot_manager", depotId: "" });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    const depotId = typeof user.depotId === "object" ? user.depotId?._id : user.depotId ?? "";
    setSelectedRole(user.role);
    reset({ name: user.name, email: user.email, role: user.role, depotId });
    setDialogOpen(true);
  };

  const onSubmit = async (values: CreateUserData) => {
    try {
      const payload = {
        ...values,
        depotId: values.depotId && values.depotId !== "none" ? values.depotId : undefined,
        password: values.password || undefined,
      };
      if (editing) {
        await updateUser.mutateAsync({ id: editing._id, ...payload });
        toast({ title: "User updated" });
      } else {
        await createUser.mutateAsync(payload as any);
        toast({ title: "User created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message ?? "Something went wrong", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget._id);
      toast({ title: "User deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const getRoleBadge = (role: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      role === "admin"
        ? "bg-purple-100 text-purple-800 border-purple-200"
        : "bg-blue-100 text-blue-800 border-blue-200"
    }`}>
      {role === "admin" ? "Admin" : "Depot Manager"}
    </span>
  );

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users and their roles"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        }
      />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Depot</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : users?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.depotId
                        ? typeof user.depotId === "object" ? user.depotId.name : user.depotId
                        : <span className="text-gray-400 italic">—</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(user)}>
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
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="John Perera" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="john@sltb.lk" />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{editing ? "Password (leave blank to keep)" : "Password"}</Label>
              <Input type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                defaultValue={editing?.role ?? "depot_manager"}
                onValueChange={(v) => {
                  setValue("role", v as "admin" | "depot_manager");
                  setSelectedRole(v as "admin" | "depot_manager");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="depot_manager">Depot Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedRole === "depot_manager" && (
              <div className="space-y-1.5">
                <Label>Depot</Label>
                <Select
                  defaultValue={
                    editing?.depotId
                      ? typeof editing.depotId === "object" ? editing.depotId._id : editing.depotId
                      : "none"
                  }
                  onValueChange={(v) => setValue("depotId", v === "none" ? "" : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select depot" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No depot</SelectItem>
                    {depots?.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={confirmDelete}
        loading={deleteUser.isPending}
      />
    </div>
  );
}
