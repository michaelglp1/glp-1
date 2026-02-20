"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { analytics } from "@/lib/posthog";

/**
 * Test page to trigger all analytics events
 *
 * Access at: /test-analytics
 *
 * This page should be disabled in production!
 */

export default function TestAnalyticsPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const testUserId = `test-user-${Date.now()}`;
  const testEmail = `test-${Date.now()}@example.com`;

  const addResult = (message: string) => {
    setResults((prev) => [...prev, message]);
  };

  const testServerSideEvents = async () => {
    setIsLoading(true);
    addResult("🚀 Testing server-side events...");

    try {
      const response = await fetch("/api/test-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: testUserId,
          email: testEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addResult("✅ All server-side events triggered successfully!");
        data.events.forEach((event: string) => addResult(`  ${event}`));
      } else {
        addResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testClientSideEvents = () => {
    addResult("\n🚀 Testing client-side events...");

    try {
      // 1. Dashboard view
      addResult("Testing dashboard_view...");
      analytics.dashboardView(testUserId);
      addResult("✅ dashboard_view tracked");

      // 2. Onboarding started
      addResult("Testing onboarding_started...");
      analytics.onboardingStarted(testUserId);
      addResult("✅ onboarding_started tracked");

      // 3. Onboarding completed
      addResult("Testing onboarding_completed...");
      analytics.onboardingCompleted(testUserId);
      addResult("✅ onboarding_completed tracked");

      // 4. Upgrade click
      addResult("Testing upgrade_click...");
      analytics.upgradeClick(testUserId, "test_page");
      addResult("✅ upgrade_click tracked");

      // 5. Stripe redirect
      addResult("Testing stripe_redirect...");
      analytics.stripeRedirect(testUserId, "premium-plan-test", "Premium Plan");
      addResult("✅ stripe_redirect tracked");

      // 6. First metric entry
      addResult("Testing first_metric_entry...");
      analytics.firstMetricEntry(testUserId, "weight");
      addResult("✅ first_metric_entry tracked");

      addResult("\n✅ All client-side events triggered successfully!");
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const testAllEvents = async () => {
    setResults([]);
    addResult(`Test User ID: ${testUserId}`);
    addResult(`Test Email: ${testEmail}\n`);

    // Test server-side events first
    await testServerSideEvents();

    // Then test client-side events
    testClientSideEvents();

    addResult("\n📊 Check PostHog dashboard in 1-2 minutes to see all events!");
    addResult(`   Filter by User ID: ${testUserId}`);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-600">
            This page is only available in development
          </h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Analytics Events Test</h1>
        <p className="text-muted-foreground mb-6">
          This page triggers all analytics events programmatically for testing.
        </p>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={testAllEvents}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Testing..." : "Test All Events"}
          </Button>

          <Button
            onClick={testServerSideEvents}
            disabled={isLoading}
            variant="outline"
          >
            Test Server-Side Only
          </Button>

          <Button
            onClick={testClientSideEvents}
            disabled={isLoading}
            variant="outline"
          >
            Test Client-Side Only
          </Button>

          <Button onClick={clearResults} variant="ghost">
            Clear Results
          </Button>
        </div>

        <Card className="p-4 bg-gray-50">
          <h2 className="font-semibold mb-2">Events to be tested:</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <h3 className="font-medium text-blue-600">Server-Side:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>signup_completed</li>
                <li>welcome_email_click</li>
                <li>onboarding_started</li>
                <li>onboarding_completed</li>
                <li>password_set</li>
                <li>first_metric_entry (all types)</li>
                <li>subscription_success</li>
                <li>payment_failed</li>
                <li>subscription_canceled</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600">Client-Side:</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>dashboard_view</li>
                <li>onboarding_started</li>
                <li>onboarding_completed</li>
                <li>upgrade_click</li>
                <li>stripe_redirect</li>
                <li>first_metric_entry</li>
              </ul>
            </div>
          </div>
        </Card>

        {results.length > 0 && (
          <Card className="p-4 mt-6 bg-black text-green-400 font-mono text-sm">
            <h2 className="font-semibold mb-2 text-white">Results:</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}
