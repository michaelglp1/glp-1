"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type VerifyState = "verifying" | "success" | "error" | "invalid";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [state, setState] = useState<VerifyState>("verifying");
  const [dots, setDots] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Animated dots for loading state
  useEffect(() => {
    if (state !== "verifying") return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state]);

  // Verify magic link token
  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("invalid");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setState("error");
          setErrorMessage(data.error || "Verification failed.");
          return;
        }

        // Success - refresh auth context to get the latest user data
        setState("success");

        // Refresh the auth context with the new session
        await refreshUser();

        // Show success state briefly then redirect
        setTimeout(() => {
          router.push(data.redirectTo || "/home");
        }, 1500);
      } catch (error) {
        console.error("Verification error:", error);
        setState("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    verifyToken();
  }, [searchParams, router]);

  const handleReturnToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {state === "verifying" && (
          <>
            <Image
              src="/illustration/waiting.svg"
              alt="verifying"
              width={400}
              height={300}
              className="aspect-[4/3] rounded-lg object-cover mb-2"
            />
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Verifying your link{dots}
              </h1>
              <p className="text-muted-foreground">
                Please wait while we authenticate your account.
              </p>
            </div>

            <div className="mt-6">
              <div className="animate-spin [animation-duration:0.4s] w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <Image
              src="/illustration/thumbs-up.svg"
              alt="success"
              width={400}
              height={300}
              className="aspect-[4/3] rounded-lg object-cover mb-2"
            />
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                Verification Successful!
              </h1>
              <p className="text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </div>

            <div className="mt-6">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto" />
            </div>
          </>
        )}

        {(state === "error" || state === "invalid") && (
          <>
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-red-700">
              {state === "invalid" ? "Invalid Link" : "Verification Failed"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {errorMessage ||
                "The verification link is invalid or has expired. Please request a new one."}
            </p>
            <Button onClick={handleReturnToLogin} className="w-full">
              Return to Login
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
