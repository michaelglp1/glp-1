"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSuccess(true);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6 px-5", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex w-full flex-col">
        <h1 className="text-3xl font-bold leading-tight">Get Magic Link</h1>
        <p className="font-medium mt-2">
          No password needed. Just click and you're in.
        </p>
      </div>

      {success ? (
        <div className="grid gap-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-medium mb-1">Magic link sent!</p>
            <p className="text-sm">
              Check your email and click the link to access your account. The
              link expires in 15 minutes.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="w-full h-11"
            onClick={() => router.push("/login")}
          >
            Return to Login
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="min-h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? "Sending magic link..." : "Send Magic Link"}
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-slate-500 font-medium">
            Remember your password?{" "}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full h-11 text-blue-700 hover:bg-primary/10 hover:text-blue-700"
        disabled={isLoading}
        onClick={() => router.push("/login")}
      >
        Back to Login
      </Button>
    </form>
  );
}
