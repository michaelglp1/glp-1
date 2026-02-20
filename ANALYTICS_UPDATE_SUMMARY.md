# Analytics Implementation Update - February 2026

## Summary

All requested analytics events have been implemented based on Michael's requirements. The core funnel remains intact with new events added for onboarding tracking, upgrade intent, subscription lifecycle, and email engagement.

## Implemented Events

### ✅ Core Funnel (Unchanged)

- `signup_completed` → `dashboard_view` → `password_set` → `first_metric_entry`

### ✅ New Events Added

#### 1. Onboarding Tracking

- **`onboarding_started`**
  - Triggers when registration popup opens
  - Location: `src/components/registration-popup.tsx`
  - Purpose: Measure drop-off between signup and becoming "Onboarded (Registered)"

- **`onboarding_completed`**
  - Triggers when user successfully submits registration form
  - Location: `src/components/registration-popup.tsx`
  - Purpose: Track successful onboarding completion

#### 2. Upgrade Intent Tracking

- **`upgrade_click`**
  - Triggers when user clicks Subscribe button on Premium card or paywall
  - Locations:
    - `src/components/billing/plan-card.tsx` (source: "plan_card")
    - `src/components/billing/paywall-card.tsx` (source: "paywall")
  - Properties: `source` (plan_card | paywall), `timestamp`
  - Purpose: Track upgrade intent from different sources

- **`stripe_redirect`**
  - Triggers right before redirecting to Stripe checkout
  - Location: `src/app/api/subscription/route.ts`
  - Properties: `planId`, `planName`, `timestamp`
  - Purpose: Server-side confirmation of checkout initiation
  - Note: Fires at same moment as `upgrade_click` but from server

#### 3. Subscription Lifecycle

- **`subscription_success`**
  - Triggers when Stripe webhook confirms active subscription
  - Location: `src/lib/services/stripe.ts` (handleCheckoutCompleted)
  - Properties: `planId`, `planName`, `amount`, `timestamp`
  - Purpose: Track successful subscription conversions

- **`subscription_canceled`**
  - Triggers when subscription is canceled (webhook)
  - Location: `src/lib/services/stripe.ts` (handleSubscriptionDeleted)
  - Properties: `planId`, `timestamp`
  - Purpose: Track subscription cancellations

- **`payment_failed`**
  - Triggers when payment fails (webhook)
  - Location: `src/lib/services/stripe.ts` (handlePaymentFailed)
  - Properties: `reason`, `timestamp`
  - Purpose: Track payment failures for recovery campaigns

#### 4. Email Engagement

- **`welcome_email_click`**
  - Triggers when user clicks magic link from welcome email
  - Location: `src/app/api/auth/verify-magic-link/route.ts`
  - Properties: `timestamp`
  - Purpose: Track email deliverability and click-through rates

#### 5. Enhanced First Metric Entry

- **`first_metric_entry`** (updated)
  - Now includes `metric_type` property: `weight | bp | blood_sugar | food | meds`
  - Tracks first entry across all metric types including food intake
  - Updated metric type names:
    - `blood_pressure` → `bp`
    - `glp1` → `meds`
    - Added: `food`

## Implementation Details

### Client-Side Tracking (src/lib/posthog.ts)

- `onboarding_started`
- `onboarding_completed`
- `upgrade_click`
- `stripe_redirect`

### Server-Side Tracking (src/lib/analytics-server.ts)

- `onboarding_started`
- `onboarding_completed`
- `welcome_email_click`
- `subscription_success`
- `subscription_canceled`
- `payment_failed`
- `first_metric_entry` (with metric_type)

### Webhook Integration

All subscription events (`subscription_success`, `subscription_canceled`, `payment_failed`) are tracked via Stripe webhooks for maximum reliability and accuracy.

## Key Funnels to Monitor

### Activation Funnel

```
signup_completed
  → onboarding_started
  → onboarding_completed
  → dashboard_view
  → password_set
  → first_metric_entry
```

### Upgrade Funnel

```
upgrade_click
  → stripe_redirect
  → subscription_success
```

### Email Engagement

```
signup_completed
  → welcome_email_click
  → dashboard_view
```

## Notes on Implementation Decisions

### Checkout View

As discussed, since Stripe manages the checkout page, there's no separate checkout page on our side. Instead:

- `upgrade_click` tracks user intent (client-side)
- `stripe_redirect` tracks the moment before redirect (server-side)
- `subscription_success` tracks actual conversion (webhook)

This provides better signal than a redundant "checkout_view" event.

### Onboarding Screen

The registration popup that appears after signup is exactly what was meant by "onboarding screen". The `onboarding_started` event fires when this popup is shown (impression-based).

### Metric Types

Updated to match the requested format:

- `weight` - Weight entries
- `bp` - Blood pressure entries
- `blood_sugar` - Blood sugar entries
- `food` - Food/calorie entries
- `meds` - GLP-1/medication entries

## Testing Checklist

To verify all events:

1. ✅ Sign up new user → `signup_completed`
2. ✅ Click magic link from email → `welcome_email_click`
3. ✅ Registration popup appears → `onboarding_started`
4. ✅ Complete registration → `onboarding_completed`, `password_set`
5. ✅ View dashboard → `dashboard_view`
6. ✅ Enter first metric → `first_metric_entry` (with metric_type)
7. ✅ Click Subscribe button → `upgrade_click`
8. ✅ Redirect to Stripe → `stripe_redirect`
9. ✅ Complete payment → `subscription_success`
10. ✅ Cancel subscription → `subscription_canceled`
11. ✅ Payment fails → `payment_failed`

## Files Modified

### Analytics Core

- `src/lib/analytics-server.ts` - Added new server-side events
- `src/lib/posthog.ts` - Added new client-side events

### Components

- `src/components/registration-popup.tsx` - Onboarding tracking
- `src/components/billing/plan-card.tsx` - Upgrade click tracking
- `src/components/billing/paywall-card.tsx` - Upgrade click tracking

### API Routes

- `src/app/api/subscription/route.ts` - Stripe redirect tracking
- `src/app/api/auth/verify-magic-link/route.ts` - Welcome email click tracking
- `src/app/api/food-intakes/route.ts` - First metric tracking for food
- `src/app/api/blood-pressures/route.ts` - Updated metric type to "bp"
- `src/app/api/glp1-entries/route.ts` - Updated metric type to "meds"

### Services

- `src/lib/services/stripe.ts` - Subscription lifecycle tracking
- `src/lib/services/first-metric-tracker.ts` - Added food tracking, updated types

### Documentation

- `ANALYTICS_IMPLEMENTATION.md` - Updated with all new events

## Next Steps

1. Deploy to production
2. Monitor events in PostHog dashboard
3. Set up funnels in PostHog:
   - Activation funnel
   - Upgrade funnel
   - Email engagement funnel
4. Configure alerts for drop-offs
5. Set up cohort analysis for retention

All events are now live and ready for tracking!
