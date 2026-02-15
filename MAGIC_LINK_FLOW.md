# Magic Link Authentication Flow

## Overview

Implemented a passwordless magic link authentication system for both new user signups and existing user logins. Users receive a one-click link in their email that automatically logs them in and redirects them to their dashboard.

## Use Cases

### 1. New User Signup

Users who just signed up receive a welcome email with a magic link to access their account without setting a password first.

### 2. Forgot Password / Login Link

Users who can't remember their password (or never set one) can request a login link instead of resetting their password.

## Flow Diagrams

### Signup Flow

```
User Signs Up
    ↓
Account Created (auto-generated password)
    ↓
Magic Link Token Generated (24hr expiry)
    ↓
Welcome Email Sent with Magic Link
    ↓
User Clicks "Go to Free Dashboard" Button
    ↓
Redirected to /auth/verify?token=xyz
    ↓
Token Validated & Session Created
    ↓
Redirected to /home
```

### Login Link Flow (Forgot Password)

```
User Clicks "Need a login link?" on Login Page
    ↓
Enters Email Address
    ↓
Magic Link Token Generated (24hr expiry)
    ↓
Login Link Email Sent
    ↓
User Clicks "Log In to Your Account" Button
    ↓
Redirected to /auth/verify?token=xyz
    ↓
Token Validated & Session Created
    ↓
Redirected to /home
```

## Implementation Details

### 1. Database Schema

- Extended `PasswordResetToken` table with `type` field
- Types: `password_reset` or `magic_link`
- Tokens expire after 24 hours
- One-time use (marked as `used` after verification)

### 2. Token Generation (`src/lib/auth.ts`)

- `generateMagicLinkToken(userId)`: Creates secure random token
- `verifyMagicLinkToken(token)`: Validates and marks token as used

### 3. Signup Flow (`src/app/api/signup/route.ts`)

- User signs up with email, firstName, lastName
- Account created with auto-generated password
- Magic link token generated
- Welcome email sent with magic link

### 4. Email Service (`src/lib/services/brevo.service.ts`)

- `sendSignupWelcomeEmail()`: Sends welcome email with magic link
  - CTA: "Go to Free Dashboard"
  - Link: `{NEXT_PUBLIC_APP_URL}/auth/verify?token={token}`
- `sendLoginLinkEmail()`: Sends login link for forgot password flow
  - CTA: "Log In to Your Account"
  - Link: `{NEXT_PUBLIC_APP_URL}/auth/verify?token={token}`
  - Expires in 24 hours

### 5. Verification Page (`src/app/auth/verify/page.tsx`)

- Beautiful loading state with animated dots
- Calls `/api/auth/verify-magic-link` endpoint
- Shows success/error states
- Auto-redirects to `/home`

### 6. Verification API (`src/app/api/auth/verify-magic-link/route.ts`)

- Validates magic link token
- Creates authenticated session (JWT + HTTP-only cookie)
- Always redirects to `/home`
- Handles all error cases gracefully

### 7. Forgot Password Flow

- Page: `src/app/(auth)/forgot-password/page.tsx`
- Component: `src/components/forgot-password-form.tsx`
- Renamed to "Need to log in?" instead of "Forgot your password?"
- Button text: "Send Login Link" instead of "Send Reset Link"
- Uses same magic link system as signup
- API endpoint: `/api/auth/request-password-reset` (repurposed for magic links)

### 8. Login Form Updates

- Changed "Forgot password?" link to "Need a login link?"
- Links to `/forgot-password` page

## Security Features

1. **One-time use**: Tokens are marked as used after first verification
2. **Time-limited**: 24-hour expiration
3. **Secure random**: 32-byte cryptographically secure tokens
4. **HTTP-only cookies**: Session tokens stored securely
5. **Type validation**: Ensures token is specifically for magic links
6. **Email enumeration prevention**: Always returns success message

## User Experience

1. **Seamless onboarding**: No password required initially
2. **One-click authentication**: Single button in email
3. **Passwordless login**: Users can request login links instead of resetting passwords
4. **Clear feedback**: Loading states, success/error messages
5. **Graceful fallback**: Error handling with return to login option
6. **Unified experience**: Same verification flow for both signup and login

## Environment Variables Required

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
BREVO_API_KEY=your-brevo-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
```

## Testing the Flow

### Signup Flow

1. Sign up a new user at `/signup`
2. Check email for welcome message
3. Click "Go to Free Dashboard" button
4. Should see verification loading screen
5. Auto-redirect to `/home` with active session

### Login Link Flow

1. Go to `/login`
2. Click "Need a login link?"
3. Enter your email address
4. Check email for login link
5. Click "Log In to Your Account" button
6. Should see verification loading screen
7. Auto-redirect to `/home` with active session

## Future Enhancements

- [ ] Add magic link resend functionality
- [ ] Track magic link click analytics
- [ ] Add rate limiting for token generation
- [ ] Support custom redirect URLs
- [ ] Add email verification status to user model
- [ ] Consider removing password-based login entirely
