import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Route {
  _id: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estimatedDuration: number; // minutes
}

const fetchRoutes = async () => {
  const { data } = await api.get("/routes");
  return data.data as Route[];
};

export function useRoutes() {
  return useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Route>) => api.post("/routes", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Route> & { id: string }) =>
      api.put(`/routes/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/routes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
}
