# Phase 1 Features: Foundation (Months 1-2)

**Goal:** Transform from free tool → Revenue-generating SaaS platform
**Timeline:** 6-8 weeks
**Team:** 1 full-stack developer
**Success Criteria:** 50+ paying customers, $1,000+ MRR

---

## Feature 1.1: User Authentication & Management

### Overview
Implement complete user authentication system to enable account creation, login, and profile management.

### User Stories

**As a new visitor:**
- I want to sign up with email/password so I can create an account
- I want to sign up with Google OAuth so I can skip filling forms
- I want to receive a verification email so I can confirm my account

**As a returning user:**
- I want to log in with my credentials so I can access my account
- I want to reset my password if I forget it
- I want to stay logged in across sessions

**As a logged-in user:**
- I want to update my profile information
- I want to change my password
- I want to delete my account

### Acceptance Criteria

#### Sign Up
- [ ] Email/password registration works
- [ ] Google OAuth sign up works
- [ ] Email verification sent upon registration
- [ ] Cannot create duplicate accounts with same email
- [ ] Password must be 8+ characters with 1 number
- [ ] Error messages are clear and helpful
- [ ] Redirect to onboarding after successful signup

#### Login
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] "Remember me" checkbox functions correctly
- [ ] Failed login shows appropriate error message
- [ ] Rate limiting after 5 failed attempts

#### Password Reset
- [ ] "Forgot password" link sends reset email
- [ ] Reset link expires after 24 hours
- [ ] Password successfully updates
- [ ] User is logged in after successful reset

#### Profile Management
- [ ] User can update name and email
- [ ] User can change password
- [ ] User can delete account (with confirmation)
- [ ] Account deletion removes all user data

### Technical Requirements

**Authentication Provider:** Supabase Auth (recommended) or Firebase Auth

**Database Schema:**
```sql
users (
  id: uuid (primary key)
  email: string (unique)
  created_at: timestamp
  email_verified: boolean
  auth_provider: enum ('email', 'google')
)

user_profiles (
  user_id: uuid (foreign key)
  full_name: string
  company_name: string (optional)
  avatar_url: string (optional)
  updated_at: timestamp
)
```

**API Endpoints:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/password-reset
- PUT /api/auth/profile
- DELETE /api/auth/account

### UI/UX Requirements

**Sign Up Page:**
- Clean, minimal design
- Email/password form
- Google sign in button
- Link to login page
- Terms of service checkbox

**Login Page:**
- Email/password form
- Google sign in button
- "Remember me" checkbox
- "Forgot password" link
- Link to sign up page

**Profile Page:**
- Display current user info
- Editable fields for name, email
- Change password section
- Delete account button (with warning)

### Success Metrics
- 90%+ successful registration rate
- <5% bounce rate on auth pages
- <2% support tickets related to authentication

### Dependencies
- Supabase/Firebase account setup
- Email service provider (SendGrid/Resend)
- SSL certificate for secure authentication

---

## Feature 1.2: Backend API Proxy for Gemini

### Overview
Create backend proxy to handle Gemini API calls using platform API keys, removing need for users to provide their own.

### User Stories

**As a user:**
- I want mockups to generate without providing my own API key
- I want generation to be fast and reliable
- I want to see clear error messages if generation fails

**As a system administrator:**
- I want to track API usage per user
- I want to implement rate limiting
- I want to rotate API keys to prevent rate limit issues

### Acceptance Criteria

- [ ] User can generate mockup without providing API key
- [ ] API calls are authenticated with user session
- [ ] Generation time is <30 seconds for 90%+ of requests
- [ ] Failed generations show user-friendly error messages
- [ ] API usage is logged per user
- [ ] Rate limiting prevents abuse
- [ ] API keys are securely stored (not in client-side code)
- [ ] Multiple API keys can be rotated for redundancy

### Technical Requirements

**Backend Architecture:**
```
Client Request → API Gateway → Auth Middleware →
Rate Limiter → Gemini Proxy → Gemini API → Response
```

**Environment Variables:**
```
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
```

**API Endpoints:**
- POST /api/mockups/generate
  - Input: { imageData, sceneId, variations }
  - Output: { mockupUrls[], generationId, creditsUsed }

**Database Schema:**
```sql
api_requests (
  id: uuid
  user_id: uuid
  scene_id: string
  status: enum ('pending', 'completed', 'failed')
  gemini_api_key_used: string
  response_time_ms: integer
  created_at: timestamp
)
```

### Error Handling

**API Key Exhausted:**
- Automatically try next API key in rotation
- Alert admin if all keys exhausted
- Show user: "Service temporarily unavailable"

**Rate Limited:**
- Show user: "Please wait X seconds before trying again"
- Implement exponential backoff

**Generation Failed:**
- Allow user to retry (doesn't count against quota)
- Log error for debugging
- Offer credit refund if persistent

### Success Metrics
- 99%+ API uptime
- <30s generation time (p90)
- <1% failed generations
- API costs <40% of revenue

### Dependencies
- Google Gemini API keys (3+ for redundancy)
- Backend server (Node.js/Vercel Functions)
- Monitoring service (Sentry/LogRocket)

---

## Feature 1.3: Usage Tracking & Limits

### Overview
Track user mockup generation usage and enforce tier-based limits.

### User Stories

**As a free user:**
- I want to see how many mockups I have left this month
- I want to know when my quota resets
- I want to be prompted to upgrade when I hit my limit

**As a paid user:**
- I want to see my usage statistics
- I want to be notified before I run out of credits
- I want to purchase additional credits if needed

### Acceptance Criteria

- [ ] Usage counter updates in real-time
- [ ] Usage resets on the 1st of each month
- [ ] Tier limits are enforced correctly
  - Free: 5 mockups/month
  - Starter: 50 mockups/month
  - Pro: 200 mockups/month
  - Business: 1,000 mockups/month
- [ ] User cannot exceed tier limit
- [ ] Warning shown at 80% usage
- [ ] Upgrade prompt shown when limit hit
- [ ] Usage dashboard shows historical data

### Technical Requirements

**Database Schema:**
```sql
usage_tracking (
  id: uuid
  user_id: uuid
  month: string (YYYY-MM)
  mockups_generated: integer
  tier: string
  tier_limit: integer
  created_at: timestamp
  updated_at: timestamp
)

generation_history (
  id: uuid
  user_id: uuid
  scene_id: string
  variations_count: integer
  status: enum ('success', 'failed')
  credits_used: integer
  created_at: timestamp
)
```

**API Endpoints:**
- GET /api/usage/current
  - Returns: { used, limit, remaining, resetDate }
- GET /api/usage/history
  - Returns: Array of past generations

**Business Logic:**
```javascript
function canGenerateMockup(userId, variationsRequested) {
  const usage = getCurrentMonthUsage(userId);
  const tier = getUserTier(userId);
  const limit = TIER_LIMITS[tier];

  return (usage.used + variationsRequested) <= limit;
}
```

### UI/UX Requirements

**Usage Widget (Always Visible):**
```
📊 Usage: 23 / 50 mockups this month
⏰ Resets: Jan 1, 2025
```

**At 80% Usage:**
```
⚠️ You've used 40 of 50 mockups
Consider upgrading to Pro for 200/month
[Upgrade Now]
```

**At 100% Usage:**
```
🚫 Monthly limit reached (50/50)
Your quota resets on Feb 1
[Upgrade to Pro] [View Plans]
```

### Success Metrics
- <1% billing disputes related to usage
- 20%+ conversion on upgrade prompts at limit
- 100% accuracy in usage tracking

### Dependencies
- Database with proper indexing
- Real-time updates (WebSocket or polling)
- Automated monthly reset job

---

## Feature 1.4: Payment Integration

### Overview
Integrate Stripe for subscription management and payment processing.

### User Stories

**As a user:**
- I want to subscribe to a paid plan with my credit card
- I want to upgrade/downgrade my plan anytime
- I want to cancel my subscription anytime
- I want to see my billing history

**As a business owner:**
- I want payments to be secure and PCI compliant
- I want to track MRR and churn metrics
- I want failed payments to be retried automatically

### Acceptance Criteria

- [ ] User can subscribe to any paid tier
- [ ] Stripe Checkout integration works
- [ ] Subscriptions activate immediately upon payment
- [ ] Users can upgrade/downgrade plans
- [ ] Pro-rating works correctly for plan changes
- [ ] Users can cancel subscription (ends at period end)
- [ ] Invoices are emailed automatically
- [ ] Failed payments trigger retry logic
- [ ] Webhook handling is idempotent

### Technical Requirements

**Stripe Products:**
- Create products for each tier (Starter, Pro, Business, Enterprise)
- Monthly and annual price points
- Test mode for development

**Database Schema:**
```sql
subscriptions (
  id: uuid
  user_id: uuid
  stripe_customer_id: string
  stripe_subscription_id: string
  tier: enum ('free', 'starter', 'pro', 'business', 'enterprise')
  status: enum ('active', 'canceled', 'past_due', 'trialing')
  current_period_start: timestamp
  current_period_end: timestamp
  cancel_at_period_end: boolean
  created_at: timestamp
  updated_at: timestamp
)

payments (
  id: uuid
  user_id: uuid
  stripe_invoice_id: string
  amount: integer
  status: enum ('paid', 'failed', 'refunded')
  created_at: timestamp
)
```

**API Endpoints:**
- POST /api/billing/checkout
  - Input: { tier, interval }
  - Returns: { checkoutUrl }
- POST /api/billing/portal
  - Returns: { portalUrl } (Stripe Customer Portal)
- GET /api/billing/subscription
  - Returns: Current subscription details
- POST /api/webhooks/stripe
  - Handles Stripe events

**Webhook Events to Handle:**
```
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed
- checkout.session.completed
```

### UI/UX Requirements

**Pricing Page:**
- Display all tiers with features
- Monthly/Annual toggle
- "Current Plan" badge for logged-in users
- Clear CTA buttons

**Checkout Flow:**
1. User clicks "Subscribe to Pro"
2. Redirect to Stripe Checkout
3. User enters payment details
4. Redirect back to app
5. Show success message + tier upgrade

**Billing Portal:**
- Link in settings: "Manage Subscription"
- Opens Stripe Customer Portal
- User can update card, cancel, download invoices

### Error Handling

**Payment Failed:**
1. Send email notification
2. Retry after 3 days
3. Retry after 7 days
4. If still failed, downgrade to free tier
5. Send final notification

**Webhook Failures:**
- Implement retry with exponential backoff
- Log all webhook events
- Alert if webhook endpoint is down

### Success Metrics
- >95% payment success rate
- <8% monthly churn
- <2% payment-related support tickets
- 100% webhook reliability

### Dependencies
- Stripe account (production ready)
- SSL certificate (required for Stripe)
- Email service for receipts
- Error monitoring (Sentry)

---

## Feature 1.5: Tier-Based Feature Gates

### Overview
Control feature access based on user's subscription tier.

### User Stories

**As a free user:**
- I want to see what features I'm missing
- I want clear indication of premium features

**As a paid user:**
- I want immediate access to all my tier's features
- I want to use features without interruption

### Acceptance Criteria

- [ ] Free tier limited to 3 scenes
- [ ] Starter tier gets all 10 scenes
- [ ] Free tier exports are watermarked
- [ ] Paid tiers export without watermark
- [ ] Free tier limited to 1 variation
- [ ] Feature gates show upgrade prompts
- [ ] Feature access updates immediately after subscription

### Feature Access Matrix

| Feature | Free | Starter | Pro | Business |
|---------|------|---------|-----|----------|
| Mockups/month | 5 | 50 | 200 | 1,000 |
| Scenes | 3 | 10 | 15 | 30+ |
| Variations | 1 | 3 | 8 | 16 |
| Resolution | 720p | 1080p | 4K | 4K |
| Watermark | Yes | No | No | No |
| Formats | PNG | PNG,JPG | All | All |
| Priority | No | No | Yes | Yes |
| Brand Kit | No | No | No | Yes |
| Team | No | No | No | Yes |

### Technical Implementation

**Middleware:**
```javascript
function requireTier(minimumTier) {
  return async (req, res, next) => {
    const user = req.user;
    const userTier = await getUserTier(user.id);

    if (TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[minimumTier]) {
      next();
    } else {
      res.status(403).json({
        error: 'Upgrade required',
        requiredTier: minimumTier,
        currentTier: userTier
      });
    }
  };
}
```

**Frontend Guards:**
```javascript
function FeatureGate({ requiredTier, children }) {
  const { user } = useAuth();

  if (user.tier >= requiredTier) {
    return children;
  }

  return <UpgradePrompt requiredTier={requiredTier} />;
}
```

### UI/UX Requirements

**Locked Feature Indication:**
```
🔒 4K Resolution (Pro)
This feature requires Pro plan
[Upgrade to Pro - $29/mo]
```

**Scene Library:**
- Free: 3 unlocked, 7 with lock icon
- Clicking locked scene shows upgrade modal

**Variations Selector:**
- Free: Dropdown disabled at 1, with tooltip
- Pro: Dropdown allows up to 8

### Success Metrics
- 15%+ click-through on upgrade prompts
- <5% false negatives (paid users blocked)
- Zero false positives (free users accessing paid features)

---

## Feature 1.6: Watermark for Free Tier

### Overview
Add subtle watermark to mockups generated by free tier users.

### User Stories

**As a free user:**
- I want to try the product without paying
- I understand free exports have a watermark

**As a product owner:**
- I want free tier exports to advertise the product
- I want watermark to be visible but not intrusive

### Acceptance Criteria

- [ ] All free tier exports have watermark
- [ ] Watermark says "AI Marketing Mockups" or logo
- [ ] Watermark is semi-transparent (30% opacity)
- [ ] Watermark positioned in bottom right corner
- [ ] Watermark does not obscure main content
- [ ] Paid tier exports have NO watermark
- [ ] Watermark cannot be easily removed

### Technical Implementation

**Server-Side Image Processing:**
```javascript
async function addWatermark(imageBuffer, userTier) {
  if (userTier !== 'free') return imageBuffer;

  const image = await sharp(imageBuffer);
  const watermark = await sharp('assets/watermark.png')
    .resize(150)
    .composite([{
      input: Buffer.from([255, 255, 255, 77]), // 30% opacity white
      blend: 'dest-in'
    }]);

  return image
    .composite([{
      input: watermark,
      gravity: 'southeast',
      blend: 'over'
    }])
    .toBuffer();
}
```

**Watermark Design:**
- Text: "AI Marketing Mockups" or logo
- Size: 150px wide
- Position: 20px from bottom right
- Opacity: 30%
- Color: White with subtle shadow

### UI/UX Requirements

**Preview:**
- Show watermark in preview for free users
- Label: "Free tier exports include watermark"

**Export:**
- Include watermark in downloaded file
- No option to remove for free users

**Marketing:**
- Use watermark as conversion tool
- "Remove watermark by upgrading to Starter"

### Success Metrics
- <10% user complaints about watermark
- Watermark visible in 100% of free tier exports
- 5%+ of free users cite "remove watermark" as upgrade reason

---

## (Continued in next section due to length...)

## Feature 1.7: Resolution Controls
## Feature 1.8: Usage Dashboard
## Feature 1.9: Email Notification System
## Feature 1.10: Pricing & Marketing Pages

See full specifications in engineering tickets.

---

## Phase 1 Testing Plan

### Unit Tests
- Authentication flows
- Payment processing
- Usage tracking logic
- Feature gate middleware

### Integration Tests
- Full signup → generate → subscribe flow
- Webhook handling
- Email delivery

### User Acceptance Testing
- Beta group of 20 users
- 2 weeks of testing
- Feedback survey

### Performance Tests
- Load test: 100 concurrent users
- API response time <200ms (p95)
- Database query optimization

---

## Phase 1 Launch Checklist

**Week Before Launch:**
- [ ] All P0 features complete and tested
- [ ] Stripe in production mode
- [ ] Email templates finalized
- [ ] Pricing page live
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] Support email setup

**Launch Day:**
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Watch payment success rate
- [ ] Be available for support

**Week After Launch:**
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Plan Phase 2 based on feedback
