import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface MaintenanceRecord {
  _id: string;
  busId: { _id: string; busNumber: string; registrationNumber: string };
  type: "routine" | "repair" | "breakdown";
  status: "scheduled" | "in_progress" | "completed";
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  depotId: string;
}

export interface MaintenanceDueAlert {
  busId: string;
  busNumber: string;
  registrationNumber: string;
  isDueSoon: boolean;
  isOverdue: boolean;
  nextServiceDue: string;
  daysUntilDue?: number;
  daysSinceDue?: number;
}

// Payload type for create/update — busId is always a string on write
export interface MaintenancePayload {
  busId?: string;
  type?: "routine" | "repair" | "breakdown";
  status?: "scheduled" | "in_progress" | "completed";
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
}

const fetchMaintenance = async () => {
  const { data } = await api.get("/maintenance");
  return data.data as MaintenanceRecord[];
};

const fetchMaintenanceDue = async () => {
  const { data } = await api.get("/maintenance/due");
  return data.data as MaintenanceDueAlert[];
};

export function useMaintenance() {
  return useQuery({ queryKey: ["maintenance"], queryFn: fetchMaintenance });
}

export function useMaintenanceDue() {
  return useQuery({ queryKey: ["maintenance-due"], queryFn: fetchMaintenanceDue });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MaintenancePayload & { busId: string }) =>
      api.post("/maintenance", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}

export function useUpdateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: MaintenancePayload & { id: string }) =>
      api.put(`/maintenance/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["maintenance-due"] });
    },
  });
}

export function useDeleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/maintenance/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}
