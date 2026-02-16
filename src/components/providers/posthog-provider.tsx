"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, analytics } from "@/lib/posthog";
import { useAuth } from "@/contexts/auth-context";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const hasTrackedDashboardView = useRef(false);

  useEffect(() => {
    // Initialize PostHog
    initPostHog();
  }, []);

  useEffect(() => {
    // Identify user when they're logged in, reset when logged out
    if (user?.id && user?.email) {
      analytics.identify(user.id, { email: user.email });
    } else if (!user) {
      // User logged out, reset PostHog
      analytics.reset();
      hasTrackedDashboardView.current = false;
    }
  }, [user?.id, user?.email, user]);

  useEffect(() => {
    // Track page views on route change
    if (pathname) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      analytics.pageView(url);
    }

    // Reset dashboard view tracking when pathname changes
    if (pathname !== "/home") {
      hasTrackedDashboardView.current = false;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Track dashboard view when user visits /home and user data is loaded
    if (pathname === "/home" && user?.id && !hasTrackedDashboardView.current) {
      analytics.dashboardView(user.id);
      hasTrackedDashboardView.current = true;
    }
  }, [pathname, user?.id]);

  return <>{children}</>;
}
