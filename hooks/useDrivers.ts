import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  contactNumber: string;
  availability: "available" | "on_duty" | "off" | "leave";
  depotId: string;
}

const fetchDrivers = async () => {
  const { data } = await api.get("/drivers");
  return data.data as Driver[];
};

export function useDrivers() {
  return useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Driver>) => api.post("/drivers", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Driver> & { id: string }) =>
      api.put(`/drivers/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}
