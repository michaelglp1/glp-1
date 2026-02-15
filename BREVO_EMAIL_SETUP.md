# Brevo Email Template Setup Guide

This guide explains how to set up and manage email templates in Brevo for easy updates without touching code.

## 🚀 Quick Start

**Can't find the templates menu?** Here's the correct path:

1. Log in to https://app.brevo.com
2. Click **Campaigns** in the left sidebar
3. Click **Templates**
4. Click **Create Template** → **Email template**

## Overview

The app uses Brevo for transactional emails with template-based approach:

- **Template ID 1**: Waitlist welcome email
- **Template ID 3**: Signup welcome email (using existing "common" template)

Your existing "common" template (#3) is already set up and ready to use! It has a simple `{{email.BODY}}` variable that the code populates with the welcome message.

## Why Use Templates?

Templates allow you to:

- Update email content directly in Brevo dashboard (no code changes needed)
- A/B test different email versions
- Use Brevo's drag-and-drop editor
- Preview emails before sending
- Track email performance

## Setup Instructions

### ✅ Already Done!

You're already using template #3 ("common") which has a `{{email.BODY}}` variable. The code is now configured to use this template automatically.

### How It Works

The code sends the entire welcome message as the `BODY` parameter to your template:

- Template variable: `{{email.BODY}}`
- The code populates it with a formatted welcome message including the user's name, plan, and next steps

### Optional: Customize the Template

If you want to customize the template design (add logo, colors, etc.):

1. Log in to your Brevo account at https://app.brevo.com
2. Navigate to **Campaigns** → **Templates** (in the left sidebar)
3. Find template #3 "common"
4. Click **Edit**
5. Customize the design around the `{{email.BODY}}` variable
6. Click **Save & Quit**

### 1. Available Template Variables

The code passes these variables to your Brevo template:

**Primary variable (used in "common" template):**

```
{{ email.BODY }}           - Complete formatted welcome message
```

**Additional variables (available for custom templates):**

```
{{ params.FIRSTNAME }}      - User's first name
{{ params.LASTNAME }}       - User's last name
{{ params.FULLNAME }}       - Full name (First + Last)
{{ params.EMAIL }}          - User's email address
{{ params.SIGNUP_DATE }}    - Formatted signup date
{{ params.APP_URL }}        - Your app URL
{{ params.PLAN }}           - Subscription plan (e.g., "Free")
```

### 3. Sample Email Template Content

Here's a suggested structure for your welcome email:

**Subject Line:**

```
Welcome to My Daily Health Journal, {{ params.FIRSTNAME }}! 🎉
```

**Email Body:**

```
Hi {{ params.FIRSTNAME }},

Welcome to My Daily Health Journal! We're excited to have you on board.

Your account has been successfully created with the {{ params.PLAN }} plan.

Here's what you can do next:
✓ Complete your health profile
✓ Start tracking your daily health metrics
✓ Set up your medication reminders
✓ Connect with your healthcare providers

Get Started: {{ params.APP_URL }}/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The My Daily Health Journal Team

---
Signed up on {{ params.SIGNUP_DATE }}
```

### 4. Change Template ID (if needed)

The code is configured to use template #3 by default. To use a different template:

**Option 1: Update Environment Variable (Recommended)**

1. Open `.env` file
2. Change `BREVO_SIGNUP_TEMPLATE_ID='3'` to your template ID
3. Restart your server

**Option 2: Update Code Directly**

1. Open `src/lib/services/brevo.service.ts`
2. Find `private static signupTemplateId = process.env.BREVO_SIGNUP_TEMPLATE_ID || "3";`
3. Change the default value from `"3"` to your template ID

## Testing Your Email

### Test from Brevo Dashboard

1. Go to **Campaigns** → **Templates**
2. Find and click on template #3 "common"
3. Click **Send a test** button (usually in the top right)
4. Enter your email address
5. In the test data, add:
   ```json
   {
     "BODY": "Hi John,\n\nWelcome to My Daily Health Journal! This is a test email.\n\nBest regards,\nThe Team"
   }
   ```
6. Click **Send**
7. Check your inbox

### Test from Your App

1. Create a new user account through signup
2. Check the server logs for:
   ```
   [EMAIL SUCCESS] Sent welcome email to user@example.com (Message ID: xxx)
   ```
3. Check your email inbox

### Troubleshooting

If emails aren't sending:

1. **Check Brevo API Key**
   - Verify `BREVO_API_KEY` is set in `.env`
   - Test connection: The service logs will show if API key is invalid

2. **Check Template ID**
   - Verify `BREVO_SIGNUP_TEMPLATE_ID='3'` in `.env`
   - Ensure template #3 exists in your Brevo account
   - Template must be in "Active" status in Brevo

3. **Check Server Logs**
   - Look for `[EMAIL ERROR]` messages
   - Common issues:
     - Invalid template ID
     - Template not activated
     - API rate limits exceeded

4. **Check Brevo Dashboard**
   - Go to **Statistics** → **Transactional**
   - View sent emails and delivery status
   - Check for bounces or blocks

## Updating Email Content

To update the welcome email content:

1. Log in to Brevo dashboard at https://app.brevo.com
2. Navigate to **Campaigns** → **Templates**
3. Find your "Signup Welcome Email" template
4. Click on the template name to open it
5. Click **Edit** button
6. Make your changes in the editor
7. Click **Save & Quit**
8. Ensure the template status is **Active** (green play icon)
9. **No code deployment needed!** Changes take effect immediately

💡 **Tip**: You can preview your changes before saving by clicking the preview icon

## Adding More Variables

If you need to pass additional data to the email template:

1. Open `src/app/api/signup/route.ts`
2. Find the `sendSignupWelcomeEmail` call
3. Add your variables to the params object:
   ```typescript
   const emailResult = await BrevoService.sendSignupWelcomeEmail(
     email,
     firstName,
     lastName,
     {
       PLAN: "Free",
       YOUR_NEW_VARIABLE: "value", // Add here
     },
   );
   ```
4. Use in template: `{{ params.YOUR_NEW_VARIABLE }}`

## Email Templates Overview

| Template ID | Name             | Purpose              | Trigger              | Status    |
| ----------- | ---------------- | -------------------- | -------------------- | --------- |
| 1           | Waitlist Welcome | User joins waitlist  | Waitlist signup      | ✅ Active |
| 3           | Common           | Signup welcome email | User creates account | ✅ Active |

## Best Practices

1. **Keep templates simple** - Focus on clear, actionable content
2. **Test thoroughly** - Always send test emails before going live
3. **Monitor delivery** - Check Brevo statistics regularly
4. **Use variables** - Personalize with user data
5. **Mobile-friendly** - Ensure templates look good on mobile devices
6. **Clear CTAs** - Include obvious next steps for users

## Support

- Brevo Documentation: https://developers.brevo.com/
- Brevo Support: https://help.brevo.com/
- Template Variables Guide: https://help.brevo.com/hc/en-us/articles/360000268730
