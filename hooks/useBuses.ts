import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Bus {
  _id: string;
  number: string;
  model: string;
  mileage: number;
  dailyFuelConsumption: number;
  dailyRevenue: number;
  maintenanceCost: number;
  status: "active" | "inactive" | "maintenance" | "breakdown";
  depotId: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
}

export interface BusMaintenanceStatus {
  busId: string;
  busNumber: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  status: string;
}

const fetchBuses = async () => {
  const { data } = await api.get("/buses");
  return data.data as Bus[];
};

const fetchBusMaintenanceStatus = async (busId: string) => {
  const { data } = await api.get(`/buses/maintenance-status/${busId}`);
  return data.data as BusMaintenanceStatus;
};

export function useBuses() {
  return useQuery({ queryKey: ["buses"], queryFn: fetchBuses });
}

export function useBusMaintenanceStatus(busId: string) {
  return useQuery({
    queryKey: ["bus-maintenance", busId],
    queryFn: () => fetchBusMaintenanceStatus(busId),
    enabled: !!busId,
  });
}

export function useCreateBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Bus>) => api.post("/buses", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buses"] }),
  });
}

export function useUpdateBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Bus> & { id: string }) =>
      api.put(`/buses/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buses"] }),
  });
}

export function useDeleteBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/buses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buses"] }),
  });
}
