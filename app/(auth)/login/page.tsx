"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LoginResult } from "@/services/authService";
import { auth } from "@/lib/auth";
import { BrandingPanel } from "./_components/BrandingPanel";
import { LoginForm } from "./_components/LoginForm";
import { RegisterForm } from "./_components/RegisterForm";

type Tab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [tab, setTab] = useState<Tab>("login");
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");

  const switchTab = (t: Tab) => {
    setSlideDir(t === "register" ? "right" : "left");
    setTab(t);
  };

  useEffect(() => {
    const token = auth.getToken();
    const user = auth.getUser();
    if (token && user) {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/depot/dashboard");
    }
  }, [router]);

  const handleLoginSuccess = ({ token, user }: LoginResult) => {
    login(token, user);
    router.push(user.role === "admin" ? "/admin/dashboard" : "/depot/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />

      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Transit<span className="text-blue-600">Live</span>
            </span>
          </div>

          {/* Tab switcher */}
          <div className="relative flex bg-slate-200 rounded-xl p-1 mb-8">
            {/* sliding pill */}
            <div
              className="absolute top-1 bottom-1 left-1 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out"
              style={{
                width: "calc(50% - 4px)",
                transform: tab === "register" ? "translateX(calc(100% + 4px))" : "translateX(0)",
              }}
            />
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                  tab === t ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div
            key={tab}
            className={`animate-in fade-in-0 duration-300 ${
              slideDir === "right" ? "slide-in-from-right-4" : "slide-in-from-left-4"
            }`}
          >
            {tab === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} onSwitchTab={() => switchTab("register")} />
            ) : (
              <RegisterForm onSuccess={handleLoginSuccess} onSwitchTab={() => switchTab("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
