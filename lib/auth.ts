const TOKEN_KEY = "transit_token";
const USER_KEY = "transit_user";
const COOKIE_MAX_AGE = 7 * 24 * 3600;

export type UserRole = "admin" | "depot_manager";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  depotId?: string;
}

export const auth = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `transit_token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = "transit_token=; path=/; max-age=0";
  },
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also store role in a cookie so middleware can do role-based routing
    // (JWT only contains { id }, not role)
    document.cookie = `transit_role=${user.role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    document.cookie = "transit_role=; path=/; max-age=0";
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "transit_token=; path=/; max-age=0";
    document.cookie = "transit_role=; path=/; max-age=0";
  },
};
