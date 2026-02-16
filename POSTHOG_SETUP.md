# PostHog Analytics Setup

PostHog has been integrated to track user activation and retention metrics.

## Events Being Tracked

1. **signup_completed** - When a user completes signup
2. **password_set** - When a user sets their password (completes registration)
3. **first_metric_entry** - When a user enters their first health metric (weight, blood pressure, blood sugar, or GLP-1)
4. **dashboard_view** - When a user views the home dashboard
5. **$pageview** - Automatic page view tracking

## What You Need to Do in PostHog

### 1. Create "User Activation Funnel"

This shows how many users complete the activation journey from signup to first data entry.

1. Log into PostHog at https://us.i.posthog.com
2. Go to "Insights" → "New Insight"
3. Select "Funnel" chart type
4. Add steps in order:
   - Step 1: `signup_completed`
   - Step 2: `first_metric_entry`
   - Step 3: `dashboard_view`
5. Name it: **"User Activation Funnel"**
6. Save to dashboard

**What this tells you:** What % of signups actually start using the product (enter their first health metric).

### 2. Create "7-Day User Retention"

This shows what % of users return within 7 days after signing up.

1. Go to "Insights" → "New Insight"
2. Select "Retention" chart type
3. Configure:
   - **Cohort defining event**: `signup_completed`
   - **Return event**: `dashboard_view` (or `$pageview` for any page visit)
   - **Time period**: Daily
   - **Show retention for**: 7 days
4. Name it: **"7-Day User Retention"**
5. Save to dashboard

**What this tells you:** What % of users come back within 7 days of signing up.

### 3. Create "Activation & Retention Dashboard"

1. Go to "Dashboards" → "New Dashboard"
2. Name it: **"Activation & Retention"**
3. Add these insights:

   **a) Weekly Signups**
   - Type: Trend
   - Event: `signup_completed`
   - Interval: Week
   - Name: "Weekly Signups"

   **b) Activation Rate**
   - Type: Funnel
   - Steps: `signup_completed` → `first_metric_entry`
   - Name: "Activation Rate (Signup → First Entry)"

   **c) 7-Day Retention** (the one you created above)

   **d) Daily Active Users**
   - Type: Trend
   - Event: `dashboard_view`
   - Interval: Day
   - Name: "Daily Active Users"

### 4. Optional: Time to Activation

Shows how long it takes users to enter their first metric after signup.

1. Go to "Insights" → "New Insight"
2. Select "Funnel" chart type
3. Add steps: `signup_completed` → `first_metric_entry`
4. Enable "Show time to convert"
5. Name it: **"Time to First Entry"**

**What this tells you:** How quickly users start using the product after signing up.

## Key Metrics to Watch

- **Activation Rate**: % of signups who enter their first metric (target: >40%)
- **7-Day Retention**: % of users who return within 7 days (target: >30%)
- **Time to First Entry**: Median time from signup to first metric (target: <24 hours)
- **Weekly Signups**: Growth trend

## Understanding the Events

- **signup_completed**: User created account (may not have set password yet)
- **password_set**: User completed registration by setting password
- **first_metric_entry**: User entered their first health data (KEY activation moment)
- **dashboard_view**: User visited /home page (indicates engagement)
- **$pageview**: Any page visit (useful for general activity tracking)

## Quick Checks

To verify everything is working:

1. Go to "Activity" in PostHog
2. You should see events coming in real-time
3. Click on any event to see user details and properties
4. Search for users by email in the "Persons" tab

## Troubleshooting

If events aren't showing up:

1. Check browser console for `[PostHog]` logs
2. Check Network tab for requests to `i.posthog.com`
3. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set in `.env`
4. Events may take 1-2 minutes to appear in PostHog
5. Make sure you're logged in when testing (events only track for authenticated users)
