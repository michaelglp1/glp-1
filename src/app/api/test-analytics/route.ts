/**
 * Test endpoint to trigger all analytics events
 *
 * Usage:
 *   POST /api/test-analytics
 *   Body: { userId?: string, email?: string }
 *
 * This endpoint should be disabled in production!
 */

import { NextRequest, NextResponse } from "next/server";
import { serverAnalytics } from "@/lib/analytics-server";

// Only allow in development
const isDevelopment = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  // Security check - only allow in development
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const testUserId = body.userId || `test-user-${Date.now()}`;
    const testEmail = body.email || `test-${Date.now()}@example.com`;

    const events: string[] = [];

    // Helper to track and log events
    const trackEvent = async (
      name: string,
      fn: () => Promise<void>,
    ): Promise<void> => {
      try {
        await fn();
        events.push(`✅ ${name}`);
      } catch (error) {
        events.push(`❌ ${name}: ${error}`);
        throw error;
      }
    };

    // 1. Signup completed
    await trackEvent("signup_completed", async () => {
      await serverAnalytics.signupCompleted(testUserId, testEmail);
    });

    // 2. Welcome email click
    await trackEvent("welcome_email_click", async () => {
      await serverAnalytics.welcomeEmailClick(testUserId);
    });

    // 3. Onboarding started
    await trackEvent("onboarding_started", async () => {
      await serverAnalytics.onboardingStarted(testUserId);
    });

    // 4. Onboarding completed
    await trackEvent("onboarding_completed", async () => {
      await serverAnalytics.onboardingCompleted(testUserId);
    });

    // 5. Password set
    await trackEvent("password_set", async () => {
      await serverAnalytics.passwordSet(testUserId);
    });

    // 6-10. First metric entries (all types)
    const metricTypes: Array<
      "weight" | "bp" | "blood_sugar" | "food" | "meds"
    > = ["weight", "bp", "blood_sugar", "food", "meds"];

    for (const metricType of metricTypes) {
      await trackEvent(`first_metric_entry (${metricType})`, async () => {
        await serverAnalytics.firstMetricEntry(testUserId, metricType);
      });
    }

    // 11. Subscription success
    await trackEvent("subscription_success", async () => {
      await serverAnalytics.subscriptionSuccess(
        testUserId,
        "premium-plan-test",
        "Premium Plan",
        9.99,
      );
    });

    // 12. Payment failed
    await trackEvent("payment_failed", async () => {
      await serverAnalytics.paymentFailed(testUserId, "Test payment failure");
    });

    // 13. Subscription canceled
    await trackEvent("subscription_canceled", async () => {
      await serverAnalytics.subscriptionCanceled(
        testUserId,
        "premium-plan-test",
      );
    });

    // Flush events
    await serverAnalytics.flush();

    return NextResponse.json({
      success: true,
      message: "All analytics events triggered successfully",
      testUserId,
      testEmail,
      events,
      note: "Check PostHog dashboard in 1-2 minutes to see the events. Client-side events (upgrade_click, stripe_redirect, dashboard_view) need to be tested in the browser.",
    });
  } catch (error) {
    console.error("Error testing analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger analytics events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    message: "Analytics test endpoint",
    usage: "POST /api/test-analytics with optional body: { userId, email }",
    availableEvents: [
      "signup_completed",
      "welcome_email_click",
      "onboarding_started",
      "onboarding_completed",
      "password_set",
      "first_metric_entry (weight, bp, blood_sugar, food, meds)",
      "subscription_success",
      "payment_failed",
      "subscription_canceled",
    ],
    note: "Client-side events (upgrade_click, stripe_redirect, dashboard_view) need to be tested in the browser.",
  });
}
