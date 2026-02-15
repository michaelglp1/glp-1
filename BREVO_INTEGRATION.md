# Brevo Email Marketing Setup

## Current Integration

When someone signs up on your app at `/api/signup`, they are automatically:

1. Added to Brevo List ID: **4**
2. Sent a welcome email with subject: "Welcome to My Daily Health Journal"
3. Tagged with: `signup`, `welcome`

### Contact Information Stored in Brevo:

- First Name
- Last Name
- Email
- Plan: "free"
- Source: "app_signup"
- Created Date

## For Your Blog + Facebook Funnel

You'll need to create new lists in your Brevo account for:

1. **Blog Newsletter Subscribers** - Create a new list (e.g., List ID 7)
2. **Facebook Lead Ads** - Create a new list (e.g., List ID 8)

Then you can segment and nurture these leads separately from app signups.

### Tracking Lead Sources

Each contact gets a `SOURCE` field that tells you where they came from:

- `app_signup` - Direct app registration
- `blog` - Blog newsletter signup (you'll set this up)
- `facebook_ads` - Facebook lead ads (you'll set this up)

This lets you create different email sequences for each funnel in Brevo.

## Questions?

The signup endpoint is at: `POST /api/signup`

If you need new endpoints for blog or Facebook leads, let me know and I can add them.
