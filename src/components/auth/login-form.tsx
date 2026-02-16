"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError("");
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      // Redirect to home page on successful login
      router.push("/home");
    } catch (error: unknown) {
      console.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during login",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6 px-5", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex w-full flex-col">
        <h1 className="text-3xl font-bold leading-tight">Sign in</h1>
        <p className="font-medium mt-2">
          Free to start. No credit card required.
        </p>
        <p className="text-muted-foreground text-sm">
          Track trends, not just the scale.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            className={`${errors.email ? "border-red-500" : ""} min-h-11`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm underline underline-offset-4 hover:text-primary"
            >
              Email me a sign-in link
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className={`${errors.password ? "border-red-500" : ""} min-h-11`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant={"outline"}
        size="lg"
        className="w-full h-11 text-blue-700 hover:bg-primary/10 hover:text-blue-700"
        disabled={isLoading}
        onClick={() => router.push("/register")}
      >
        Create Free Account
      </Button>
    </form>
  );
}
