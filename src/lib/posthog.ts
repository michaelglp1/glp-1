import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
    });
  }
  return posthog;
}

// Analytics event tracking functions
export const analytics = {
  // Track signup completion
  signupCompleted: (userId: string, email: string) => {
    posthog.identify(userId, { email });
    posthog.capture("signup_completed", {
      email,
      timestamp: new Date().toISOString(),
    });
  },

  // Track password set (for users who complete registration)
  passwordSet: (userId: string) => {
    posthog.capture("password_set", {
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // Track first metric entry (activation event)
  firstMetricEntry: (userId: string, metricType: string) => {
    posthog.capture("first_metric_entry", {
      userId,
      metricType,
      timestamp: new Date().toISOString(),
    });
  },

  // Track dashboard view
  dashboardView: (userId: string) => {
    posthog.capture("dashboard_view", {
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // Track page views
  pageView: (path: string) => {
    posthog.capture("$pageview", {
      $current_url: path,
    });
  },

  // Identify user
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  // Reset on logout
  reset: () => {
    posthog.reset();
  },
};
