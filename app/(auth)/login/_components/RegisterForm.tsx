"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { registerUser, LoginResult } from "@/services/authService";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: (result: LoginResult) => void;
  onSwitchTab: () => void;
}

export function RegisterForm({ onSuccess, onSwitchTab }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      onSuccess(await registerUser(values.name, values.email, values.password));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
        <p className="text-slate-500 text-sm mt-1">Register as a depot manager</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField id="reg-name" label="Full name" Icon={User} error={errors.name?.message}>
          <Input
            id="reg-name"
            type="text"
            placeholder="Your full name"
            className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            {...register("name")}
          />
        </FormField>

        <FormField id="reg-email" label="Email address" Icon={Mail} error={errors.email?.message}>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@sltb.lk"
            className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            {...register("email")}
          />
        </FormField>

        <FormField id="reg-password" label="Password" Icon={Lock} error={errors.password?.message}>
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
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

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-blue-700 font-medium">Depot Manager</span>
          <span className="text-xs text-blue-500 ml-auto">assigned role</span>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg mt-2 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <button onClick={onSwitchTab} className="text-blue-600 font-medium hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
