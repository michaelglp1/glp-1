# Analytics Implementation Summary

## What Was Implemented

PostHog analytics has been integrated to track user activation, retention, and subscription conversion metrics.

### Packages Installed

- `posthog-js` (client-side tracking)
- `posthog-node` (server-side tracking)

### Environment Variables Added

```
NEXT_PUBLIC_POSTHOG_KEY='phc_KfuiwnavyNFrYLvVKFut6Nzu5XpeQu5WhDNX48U2AVT'
NEXT_PUBLIC_POSTHOG_HOST='https://us.i.posthog.com'
```

### Files Created

1. `src/lib/posthog.ts` - Client-side analytics helper
2. `src/lib/analytics-server.ts` - Server-side analytics helper
3. `src/components/providers/posthog-provider.tsx` - PostHog provider component
4. `src/lib/services/first-metric-tracker.ts` - Helper to detect first metric entries

### Files Modified

1. `src/app/layout.tsx` - Added PostHogProvider wrapper
2. `src/app/api/signup/route.ts` - Track `signup_completed` event
3. `src/app/api/complete-registration/route.ts` - Track `password_set` event
4. `src/app/api/weights/route.ts` - Track `first_metric_entry` for weight
5. `src/app/api/blood-pressures/route.ts` - Track `first_metric_entry` for blood pressure
6. `src/app/api/blood-sugars/route.ts` - Track `first_metric_entry` for blood sugar
7. `src/app/api/glp1-entries/route.ts` - Track `first_metric_entry` for medications
8. `src/app/api/food-intakes/route.ts` - Track `first_metric_entry` for food
9. `src/app/home/page.tsx` - Track `dashboard_view` event
10. `src/components/registration-popup.tsx` - Track `onboarding_started` and `onboarding_completed`
11. `src/components/billing/plan-card.tsx` - Track `upgrade_click` event
12. `src/components/billing/paywall-card.tsx` - Track `upgrade_click` event
13. `src/app/api/subscription/route.ts` - Track `stripe_redirect` event
14. `src/lib/services/stripe.ts` - Track `subscription_success`, `subscription_canceled`, `payment_failed`
15. `src/app/api/auth/verify-magic-link/route.ts` - Track `welcome_email_click` event
16. `.env` - Added PostHog credentials
17. `.env.example` - Added PostHog placeholders

## Events Tracked

### Core Funnel Events

#### 1. signup_completed

- **When**: User completes signup form
- **Where**: `src/app/api/signup/route.ts`
- **Properties**: email, timestamp
- **Purpose**: Measure total signups

#### 2. dashboard_view

- **When**: User views the home dashboard
- **Where**: `src/app/home/page.tsx`
- **Properties**: timestamp
- **Purpose**: Measure engagement and return visits

#### 3. password_set

- **When**: User sets their password (completes registration)
- **Where**: `src/app/api/complete-registration/route.ts`
- **Properties**: timestamp
- **Purpose**: Measure registration completion rate

#### 4. first_metric_entry

- **When**: User enters their first health metric (weight, BP, blood sugar, food, or meds)
- **Where**: All metric API routes
- **Properties**: metric_type (weight | bp | blood_sugar | food | meds), timestamp
- **Purpose**: Measure activation (key milestone)

### Onboarding Events

#### 5. onboarding_started

- **When**: Registration popup is shown to user
- **Where**: `src/components/registration-popup.tsx`
- **Properties**: timestamp
- **Purpose**: Measure drop-off between signup and becoming "Onboarded (Registered)"

#### 6. onboarding_completed

- **When**: User successfully submits registration form
- **Where**: `src/components/registration-popup.tsx`
- **Properties**: timestamp
- **Purpose**: Track successful onboarding completion

### Upgrade Intent & Subscription Events

#### 7. upgrade_click

- **When**: User clicks Subscribe/Premium/Upgrade button
- **Where**: `src/components/billing/plan-card.tsx`, `src/components/billing/paywall-card.tsx`
- **Properties**: source (plan_card | paywall | header), timestamp
- **Purpose**: Track upgrade intent from different sources

#### 8. stripe_redirect

- **When**: Right before redirecting to Stripe checkout
- **Where**: `src/app/api/subscription/route.ts`
- **Properties**: planId, planName, timestamp
- **Purpose**: Track checkout initiation (same moment as upgrade_click but server-side)

#### 9. subscription_success

- **When**: User returns from Stripe success URL AND/OR webhook confirms active subscription
- **Where**: `src/lib/services/stripe.ts` (webhook handler)
- **Properties**: planId, planName, amount, timestamp
- **Purpose**: Track successful subscription conversions

#### 10. subscription_canceled

- **When**: Subscription is canceled (webhook event)
- **Where**: `src/lib/services/stripe.ts` (webhook handler)
- **Properties**: planId, timestamp
- **Purpose**: Track subscription cancellations

#### 11. payment_failed

- **When**: Payment fails (webhook event)
- **Where**: `src/lib/services/stripe.ts` (webhook handler)
- **Properties**: reason, timestamp
- **Purpose**: Track payment failures for recovery campaigns

### Email Engagement Events

#### 12. welcome_email_click

- **When**: User clicks magic link from welcome email
- **Where**: `src/app/api/auth/verify-magic-link/route.ts`
- **Properties**: timestamp
- **Purpose**: Track email deliverability and click-through rates

#### 13. $pageview (automatic)

- **When**: User navigates to any page
- **Where**: `src/components/providers/posthog-provider.tsx`
- **Properties**: URL path
- **Purpose**: General session tracking

## How It Works

### Client-Side Tracking

- PostHog initializes on app load
- Page views tracked automatically on route changes
- Dashboard views, onboarding, and upgrade clicks tracked when events occur
- User identified on signup

### Server-Side Tracking

- Signup, password set, first metric, subscription, and email events tracked from API routes
- Events sent directly from server (more reliable than client-side)
- Non-blocking - won't fail requests if tracking fails

### First Metric Detection

- Checks total count of all metric types (weight + BP + blood sugar + food + meds)
- If total is 1 after creation, it's the user's first metric
- Tracks event with metric_type property for analysis

## Key Funnels to Monitor

### Activation Funnel

signup_completed → onboarding_started → onboarding_completed → dashboard_view → password_set → first_metric_entry

### Upgrade Funnel

upgrade_click → stripe_redirect → subscription_success

### Email Engagement

signup_completed → welcome_email_click → dashboard_view

## Next Steps for Your Client

See `POSTHOG_SETUP.md` for detailed instructions on:

1. Creating retention analysis dashboard
2. Setting up activation funnel
3. Configuring alerts
4. Key metrics to monitor

## Testing

To verify events are being tracked:

1. Sign up a new user → `signup_completed`, `welcome_email_click`
2. Open registration popup → `onboarding_started`
3. Complete registration (set password) → `onboarding_completed`, `password_set`
4. View dashboard → `dashboard_view`
5. Enter a health metric → `first_metric_entry` (with metric_type)
6. Click Subscribe button → `upgrade_click`, `stripe_redirect`
7. Complete Stripe checkout → `subscription_success`
8. Check PostHog (events appear within 1-2 minutes)

## Notes

- Free tier: 1M events/month (sufficient for current scale)
- Events include user ID for cohort analysis
- Privacy-friendly: no PII beyond email (which user provides)
- Server-side tracking is more reliable than client-only
- All subscription events tracked via Stripe webhooks for accuracy
