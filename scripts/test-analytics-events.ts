/**
 * Test script to trigger all analytics events programmatically
 *
 * Usage:
 *   npx ts-node scripts/test-analytics-events.ts
 *
 * Or add to package.json:
 *   "test:analytics": "ts-node scripts/test-analytics-events.ts"
 */

import { serverAnalytics } from "../src/lib/analytics-server";

const TEST_USER_ID = "test-user-" + Date.now();
const TEST_EMAIL = `test-${Date.now()}@example.com`;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAllEvents() {
  console.log("🚀 Starting analytics events test...\n");
  console.log(`Test User ID: ${TEST_USER_ID}`);
  console.log(`Test Email: ${TEST_EMAIL}\n`);

  try {
    // 1. Signup completed
    console.log("1️⃣  Testing signup_completed...");
    await serverAnalytics.signupCompleted(TEST_USER_ID, TEST_EMAIL);
    console.log("✅ signup_completed tracked\n");
    await sleep(500);

    // 2. Welcome email click
    console.log("2️⃣  Testing welcome_email_click...");
    await serverAnalytics.welcomeEmailClick(TEST_USER_ID);
    console.log("✅ welcome_email_click tracked\n");
    await sleep(500);

    // 3. Onboarding started
    console.log("3️⃣  Testing onboarding_started...");
    await serverAnalytics.onboardingStarted(TEST_USER_ID);
    console.log("✅ onboarding_started tracked\n");
    await sleep(500);

    // 4. Onboarding completed
    console.log("4️⃣  Testing onboarding_completed...");
    await serverAnalytics.onboardingCompleted(TEST_USER_ID);
    console.log("✅ onboarding_completed tracked\n");
    await sleep(500);

    // 5. Password set
    console.log("5️⃣  Testing password_set...");
    await serverAnalytics.passwordSet(TEST_USER_ID);
    console.log("✅ password_set tracked\n");
    await sleep(500);

    // 6. First metric entry - weight
    console.log("6️⃣  Testing first_metric_entry (weight)...");
    await serverAnalytics.firstMetricEntry(TEST_USER_ID, "weight");
    console.log("✅ first_metric_entry (weight) tracked\n");
    await sleep(500);

    // 7. First metric entry - bp
    console.log("7️⃣  Testing first_metric_entry (bp)...");
    await serverAnalytics.firstMetricEntry(TEST_USER_ID, "bp");
    console.log("✅ first_metric_entry (bp) tracked\n");
    await sleep(500);

    // 8. First metric entry - blood_sugar
    console.log("8️⃣  Testing first_metric_entry (blood_sugar)...");
    await serverAnalytics.firstMetricEntry(TEST_USER_ID, "blood_sugar");
    console.log("✅ first_metric_entry (blood_sugar) tracked\n");
    await sleep(500);

    // 9. First metric entry - food
    console.log("9️⃣  Testing first_metric_entry (food)...");
    await serverAnalytics.firstMetricEntry(TEST_USER_ID, "food");
    console.log("✅ first_metric_entry (food) tracked\n");
    await sleep(500);

    // 10. First metric entry - meds
    console.log("🔟 Testing first_metric_entry (meds)...");
    await serverAnalytics.firstMetricEntry(TEST_USER_ID, "meds");
    console.log("✅ first_metric_entry (meds) tracked\n");
    await sleep(500);

    // 11. Subscription success
    console.log("1️⃣1️⃣  Testing subscription_success...");
    await serverAnalytics.subscriptionSuccess(
      TEST_USER_ID,
      "premium-plan-id",
      "Premium Plan",
      9.99,
    );
    console.log("✅ subscription_success tracked\n");
    await sleep(500);

    // 12. Payment failed
    console.log("1️⃣2️⃣  Testing payment_failed...");
    await serverAnalytics.paymentFailed(TEST_USER_ID, "Insufficient funds");
    console.log("✅ payment_failed tracked\n");
    await sleep(500);

    // 13. Subscription canceled
    console.log("1️⃣3️⃣  Testing subscription_canceled...");
    await serverAnalytics.subscriptionCanceled(TEST_USER_ID, "premium-plan-id");
    console.log("✅ subscription_canceled tracked\n");
    await sleep(500);

    // Flush events to PostHog
    console.log("📤 Flushing events to PostHog...");
    await serverAnalytics.flush();
    console.log("✅ Events flushed\n");

    console.log("🎉 All analytics events tested successfully!");
    console.log(
      "\n📊 Check PostHog dashboard in 1-2 minutes to see the events:",
    );
    console.log(`   User ID: ${TEST_USER_ID}`);
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(
      "\n💡 Note: Client-side events (upgrade_click, stripe_redirect, dashboard_view)",
    );
    console.log("   need to be tested in the browser as they use posthog-js.");
  } catch (error) {
    console.error("❌ Error testing analytics events:", error);
    process.exit(1);
  }
}

// Run the test
testAllEvents()
  .then(() => {
    console.log("\n✨ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test failed:", error);
    process.exit(1);
  });
