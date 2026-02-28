import api from "@/lib/axios";
import { AuthUser } from "@/lib/auth";

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post("/auth/login", { email, password });
  if (!data.success) throw new Error(data.message ?? "Login failed");
  const { token, _id, name, email: userEmail, role, depotId } = data.data;
  return { token, user: { id: _id, name, email: userEmail, role, depotId } };
}

export async function registerUser(name: string, email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post("/auth/register", { name, email, password, role: "depot_manager" });
  if (!data.success) throw new Error(data.message ?? "Registration failed");
  return loginUser(email, password);
}
