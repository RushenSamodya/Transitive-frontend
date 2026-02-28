"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { loginUser, LoginResult } from "@/services/authService";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: (result: LoginResult) => void;
  onSwitchTab: () => void;
}

export function LoginForm({ onSuccess, onSwitchTab }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }: FormData) => {
    setError(null);
    try {
      onSuccess(await loginUser(email, password));
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in to your depot account</p>
      </div>

      {error && (
        <div
          key={error}
          className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm animate-in fade-in-0 slide-in-from-top-2 duration-300"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField id="login-email" label="Email address" Icon={Mail} error={errors.email?.message}>
          <Input
            id="login-email"
            type="email"
            placeholder="you@sltb.lk"
            className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            {...register("email")}
          />
        </FormField>

        <FormField id="login-password" label="Password" Icon={Lock} error={errors.password?.message}>
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </FormField>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg mt-2 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <button onClick={onSwitchTab} className="text-blue-600 font-medium hover:underline">
          Create one
        </button>
      </p>
    </div>
  );
}
