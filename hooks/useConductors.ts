import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Conductor {
  _id: string;
  name: string;
  contactNumber: string;
  availability: "available" | "on_duty" | "off" | "leave";
  depotId: string;
}

const fetchConductors = async () => {
  const { data } = await api.get("/conductors");
  return data.data as Conductor[];
};

export function useConductors() {
  return useQuery({ queryKey: ["conductors"], queryFn: fetchConductors });
}

export function useCreateConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Conductor>) => api.post("/conductors", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conductors"] }),
  });
}

export function useUpdateConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Conductor> & { id: string }) =>
      api.put(`/conductors/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conductors"] }),
  });
}

export function useDeleteConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/conductors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conductors"] }),
  });
}
