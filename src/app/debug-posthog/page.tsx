"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analytics } from "@/lib/posthog";
import posthog from "posthog-js";

export default function DebugPostHogPage() {
  const [status, setStatus] = useState<string[]>([]);
  const testUserId = "debug-user-123";

  useEffect(() => {
    // Check if PostHog is initialized
    const checkPostHog = () => {
      const logs: string[] = [];

      logs.push("=== PostHog Debug Info ===");
      logs.push(
        `PostHog loaded: ${typeof posthog !== "undefined" ? "YES" : "NO"}`,
      );
      logs.push(
        `PostHog key: ${process.env.NEXT_PUBLIC_POSTHOG_KEY ? "SET" : "NOT SET"}`,
      );
      logs.push(
        `PostHog host: ${process.env.NEXT_PUBLIC_POSTHOG_HOST || "NOT SET"}`,
      );

      try {
        const isInitialized = posthog.__loaded;
        logs.push(`PostHog initialized: ${isInitialized ? "YES" : "NO"}`);
      } catch (e) {
        logs.push(`PostHog initialized: UNKNOWN (${e})`);
      }

      setStatus(logs);
    };

    // Check immediately
    checkPostHog();

    // Check again after 2 seconds
    setTimeout(checkPostHog, 2000);
  }, []);

  const testEvent = (eventName: string, fn: () => void) => {
    try {
      fn();
      setStatus((prev) => [...prev, `✅ ${eventName} called successfully`]);
    } catch (error) {
      setStatus((prev) => [...prev, `❌ ${eventName} failed: ${error}`]);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">PostHog Debug Page</h1>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Status:</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1">
              {status.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Test Events:</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  testEvent("onboarding_started", () =>
                    analytics.onboardingStarted(testUserId),
                  )
                }
              >
                Test onboarding_started
              </Button>

              <Button
                onClick={() =>
                  testEvent("onboarding_completed", () =>
                    analytics.onboardingCompleted(testUserId),
                  )
                }
              >
                Test onboarding_completed
              </Button>

              <Button
                onClick={() =>
                  testEvent("upgrade_click", () =>
                    analytics.upgradeClick(testUserId, "debug_page"),
                  )
                }
              >
                Test upgrade_click
              </Button>

              <Button
                onClick={() =>
                  testEvent("dashboard_view", () =>
                    analytics.dashboardView(testUserId),
                  )
                }
              >
                Test dashboard_view
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Open browser console (F12) to see detailed logs.</p>
            <p>Check PostHog dashboard in 1-2 minutes to verify events.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
