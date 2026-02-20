# Analytics Testing Guide

This guide explains how to test all analytics events programmatically without manual walkthrough.

## Quick Start

### Option 1: Browser Test Page (Recommended)

The easiest way to test all events at once:

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the test page:

   ```
   http://localhost:3000/test-analytics
   ```

3. Click "Test All Events" button

4. Check the results on the page

5. Verify in PostHog dashboard (wait 1-2 minutes for events to appear)

### Option 2: API Endpoint

Test server-side events via HTTP request:

```bash
curl -X POST http://localhost:3000/api/test-analytics \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or with custom user ID and email:

```bash
curl -X POST http://localhost:3000/api/test-analytics \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-123", "email": "test@example.com"}'
```

### Option 3: Node.js Script

Run the test script directly:

```bash
npx ts-node scripts/test-analytics-events.ts
```

Or add to package.json and run:

```json
{
  "scripts": {
    "test:analytics": "ts-node scripts/test-analytics-events.ts"
  }
}
```

```bash
npm run test:analytics
```

## What Gets Tested

### Server-Side Events (All Options)

- ✅ `signup_completed`
- ✅ `welcome_email_click`
- ✅ `onboarding_started`
- ✅ `onboarding_completed`
- ✅ `password_set`
- ✅ `first_metric_entry` (weight)
- ✅ `first_metric_entry` (bp)
- ✅ `first_metric_entry` (blood_sugar)
- ✅ `first_metric_entry` (food)
- ✅ `first_metric_entry` (meds)
- ✅ `subscription_success`
- ✅ `payment_failed`
- ✅ `subscription_canceled`

### Client-Side Events (Browser Test Page Only)

- ✅ `dashboard_view`
- ✅ `onboarding_started` (client version)
- ✅ `onboarding_completed` (client version)
- ✅ `upgrade_click`
- ✅ `stripe_redirect`
- ✅ `first_metric_entry` (client version)

## Verifying in PostHog

1. Go to your PostHog dashboard: https://us.posthog.com

2. Navigate to "Activity" or "Events"

3. Filter by the test user ID (shown in test results)

4. You should see all events with timestamps

5. Check event properties to ensure correct data

## Expected Results

After running any test option, you should see:

```
✅ signup_completed tracked
✅ welcome_email_click tracked
✅ onboarding_started tracked
✅ onboarding_completed tracked
✅ password_set tracked
✅ first_metric_entry (weight) tracked
✅ first_metric_entry (bp) tracked
✅ first_metric_entry (blood_sugar) tracked
✅ first_metric_entry (food) tracked
✅ first_metric_entry (meds) tracked
✅ subscription_success tracked
✅ payment_failed tracked
✅ subscription_canceled tracked
```

## Troubleshooting

### Events not appearing in PostHog

1. **Wait 1-2 minutes** - PostHog has a slight delay in processing events

2. **Check PostHog credentials** - Verify `.env` has correct keys:

   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

3. **Check console for errors** - Look for any error messages in terminal or browser console

4. **Verify PostHog is initialized** - Check browser console for PostHog initialization message

### Test page not accessible

- Make sure you're running in development mode (`NODE_ENV=development`)
- The test page is disabled in production for security

### API endpoint returns 403

- The test endpoint only works in development mode
- Check `NODE_ENV` environment variable

## Security Notes

⚠️ **Important**: All test utilities are disabled in production:

- `/test-analytics` page returns 403 in production
- `/api/test-analytics` endpoint returns 403 in production
- Test script can only send events to PostHog (no database access)

These safeguards prevent accidental test data in production.

## Manual Testing (If Needed)

If you prefer to test events manually through the actual user flow:

1. **Signup Flow**
   - Go to `/signup`
   - Create account → `signup_completed`
   - Check email for magic link
   - Click magic link → `welcome_email_click`

2. **Onboarding Flow**
   - Registration popup appears → `onboarding_started`
   - Fill form and submit → `onboarding_completed`, `password_set`

3. **Dashboard**
   - View `/home` → `dashboard_view`

4. **First Metric**
   - Add any health metric → `first_metric_entry` (with metric_type)

5. **Upgrade Flow**
   - Click Subscribe button → `upgrade_click`
   - Redirect to Stripe → `stripe_redirect`
   - Complete payment → `subscription_success`

6. **Subscription Management**
   - Cancel subscription → `subscription_canceled`
   - Payment fails → `payment_failed`

## Cleanup

After testing, you may want to:

1. **Delete test users from PostHog**
   - Go to PostHog → Persons
   - Search for test user IDs
   - Delete test persons

2. **Remove test files** (optional, for production):
   ```bash
   rm scripts/test-analytics-events.ts
   rm src/app/api/test-analytics/route.ts
   rm src/app/test-analytics/page.tsx
   ```

## Next Steps

Once all events are verified:

1. ✅ Set up funnels in PostHog
2. ✅ Configure retention analysis
3. ✅ Set up alerts for drop-offs
4. ✅ Create dashboards for monitoring
5. ✅ Deploy to production

See `POSTHOG_SETUP.md` for detailed PostHog configuration instructions.
