import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { token, user, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.push("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin/dashboard" : "/depot/dashboard";
  };

  return { token, user, isAuthenticated, login, logout: signOut, getDashboardPath };
}
