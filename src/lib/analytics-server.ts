import { PostHog } from "posthog-node";

// Server-side PostHog client
let posthogClient: PostHog | null = null;

function getPostHogClient() {
  if (!posthogClient && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    });
  }
  return posthogClient;
}

export const serverAnalytics = {
  // Track signup completion
  signupCompleted: async (userId: string, email: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "signup_completed",
      properties: {
        email,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track password set (for users who complete registration)
  passwordSet: async (userId: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "password_set",
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track first metric entry (activation event)
  firstMetricEntry: async (
    userId: string,
    metricType: "weight" | "bp" | "blood_sugar" | "food" | "meds",
  ) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "first_metric_entry",
      properties: {
        metric_type: metricType,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track onboarding started (registration popup shown)
  onboardingStarted: async (userId: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "onboarding_started",
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track onboarding completed (registration form submitted successfully)
  onboardingCompleted: async (userId: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "onboarding_completed",
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track welcome email click (magic link from welcome email)
  welcomeEmailClick: async (userId: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "welcome_email_click",
      properties: {
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track subscription success (Stripe checkout completed)
  subscriptionSuccess: async (
    userId: string,
    planId: string,
    planName: string,
    amount: number,
  ) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "subscription_success",
      properties: {
        planId,
        planName,
        amount,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track subscription canceled
  subscriptionCanceled: async (userId: string, planId: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "subscription_canceled",
      properties: {
        planId,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Track payment failed
  paymentFailed: async (userId: string, reason?: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "payment_failed",
      properties: {
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  },

  // Flush events (call this before serverless function ends)
  flush: async () => {
    const client = getPostHogClient();
    if (client) {
      await client.shutdown();
    }
  },
};
