import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// Shape returned by the API (managerId is populated)
export interface Depot {
  _id: string;
  name: string;
  location: string;
  city: string;
  contactNumber: string;
  managerId?: { _id: string; name: string; email: string } | null;
}

// Shape sent to the API on create/update (managerId is a plain string)
export interface DepotPayload {
  name?: string;
  location?: string;
  city?: string;
  contactNumber?: string;
  managerId?: string;
}

const fetchDepots = async () => {
  const { data } = await api.get("/depots");
  return data.data as Depot[];
};

export function useDepots() {
  return useQuery({ queryKey: ["depots"], queryFn: fetchDepots });
}

export function useCreateDepot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepotPayload) => api.post("/depots", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["depots"] }),
  });
}

export function useUpdateDepot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: DepotPayload & { id: string }) =>
      api.put(`/depots/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["depots"] }),
  });
}

export function useDeleteDepot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/depots/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["depots"] }),
  });
}
