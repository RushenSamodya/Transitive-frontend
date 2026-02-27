import { create } from "zustand";
import { auth, AuthUser } from "@/lib/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    auth.setToken(token);
    auth.setUser(user);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    auth.clear();
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = auth.getToken();
    const user = auth.getUser();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },
}));
