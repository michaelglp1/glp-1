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
  firstMetricEntry: async (userId: string, metricType: string) => {
    const client = getPostHogClient();
    if (!client) return;

    client.capture({
      distinctId: userId,
      event: "first_metric_entry",
      properties: {
        metricType,
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
