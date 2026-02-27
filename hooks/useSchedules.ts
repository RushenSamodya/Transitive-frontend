import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Schedule {
  _id: string;
  routeId: { _id: string; routeName: string; startLocation: string; endLocation: string };
  busId: { _id: string; number: string; model: string } | null;
  driverId: { _id: string; name: string } | null;
  conductorId: { _id: string; name: string } | null;
  date: string;
  departureTime: string;
  arrivalTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  tripsTotal: number;
  tripsDone: number;
  tripsRemaining: number;
  flaggedForReassignment: boolean;
  depotId: string;
}

const fetchSchedules = async () => {
  const { data } = await api.get("/schedules");
  return data.data as Schedule[];
};

export function useSchedules() {
  return useQuery({ queryKey: ["schedules"], queryFn: fetchSchedules });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Schedule> & { routeId: string; busId: string; driverId: string; conductorId: string }) =>
      api.post("/schedules", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: any) => api.put(`/schedules/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/schedules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}
