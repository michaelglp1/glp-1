# Analytics Quick Test Guide

## 🚀 Three Ways to Test All Events

### 1. Browser (Easiest - Tests Everything)

```bash
npm run dev
```

Then visit: **http://localhost:3000/test-analytics**

Click "Test All Events" button ✨

---

### 2. Command Line (Server Events Only)

```bash
npm run test:analytics
```

---

### 3. API Call (Server Events Only)

```bash
curl -X POST http://localhost:3000/api/test-analytics \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## ✅ What Gets Tested

### All 13 Events:

1. ✅ signup_completed
2. ✅ welcome_email_click
3. ✅ onboarding_started
4. ✅ onboarding_completed
5. ✅ password_set
6. ✅ first_metric_entry (weight)
7. ✅ first_metric_entry (bp)
8. ✅ first_metric_entry (blood_sugar)
9. ✅ first_metric_entry (food)
10. ✅ first_metric_entry (meds)
11. ✅ upgrade_click (browser only)
12. ✅ stripe_redirect (browser only)
13. ✅ dashboard_view (browser only)
14. ✅ subscription_success
15. ✅ payment_failed
16. ✅ subscription_canceled

---

## 📊 Verify in PostHog

1. Go to: https://us.posthog.com
2. Navigate to "Activity" or "Events"
3. Filter by test user ID (shown in results)
4. Wait 1-2 minutes for events to appear

---

## 🔒 Security

All test utilities are **automatically disabled in production**:

- Test page returns 403
- Test API returns 403
- No risk of test data in production

---

## 📝 Files Created

- `scripts/test-analytics-events.ts` - CLI test script
- `src/app/api/test-analytics/route.ts` - API endpoint
- `src/app/test-analytics/page.tsx` - Browser test page
- `ANALYTICS_TESTING.md` - Full documentation

---

## 🎯 Recommended Approach

**Use the browser test page** - it's the most comprehensive and visual:

1. `npm run dev`
2. Visit `/test-analytics`
3. Click "Test All Events"
4. See results instantly
5. Verify in PostHog

Done! 🎉
