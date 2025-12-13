# Billing & Subscription System – Design & Integration Plan

This document defines how Tijaratk’s billing and subscription system should work across:

- `tijaratk-api` (backend & billing logic)
- `tijaratk-dashboard` (admin panel)
- `tijaratk-storefront` (storefront & appearance behavior)

It assumes **`tijaratk-api/.docs/subscription-plans.md` is the single source of truth for Phase 1 MVP** and that:

- Plans: **Free** and **Pro** only in MVP.
- Billing provider: **Kashier**.
- Merchant owns **one store**.
- Add-ons are **independent**, **per-cycle only** (no carry-over to next cycle).
- No trials, no proration. Upgrades apply immediately; next billing cycle charges at new amount.
- On payment failure, there is a **grace period** before downgrade.
- Subscription state and entitlements are included in the **auth payload** for both dashboard and storefront.
- All plan features are visible in the UI (educational), with locked/gated behavior where not available.

---

## 1. High-Level Principles

- **Source of truth:** Plan details and limits come from `subscription-plans.md`.
- **Per-store billing:** One store per merchant; billing is scoped to the store.
- **Per-cycle usage limits:** Message, product, and staff limits are tracked **per store per billing cycle**, where the cycle is defined by `subscription start date`.
- **Hard enforcement in API:** The API is the final authority and **rejects over-limit actions** with structured error metadata.
- **Graceful UX in frontend:** Dashboard and storefront always **educate** users about Pro and add-ons, and use clear modals when limits are reached.
- **Kashier-centric payments:** Kashier is used for:
  - Initial subscription creation (Free → Pro).
  - Subscription renewal payments.
  - One-off payments for **add-ons** for the current billing cycle.

---

## 2. Domain Model & Entities (API)

### 2.1 Core Entities

- **Store**
  - `id`
  - `merchantId`
  - `currentPlan` (`FREE` / `PRO`)
  - `billingCycleStart` (date)
  - `billingCycleEnd` (date)
  - `subscriptionStatus` (`active`, `grace`, `past_due`, `canceled`)

- **Subscription**
  - `id`
  - `storeId`
  - `plan` (`FREE` / `PRO`)
  - `status` (`active`, `grace`, `past_due`, `canceled`)
  - `kashierSubscriptionId` (if Kashier supports recurring/subscription IDs)
  - `nextRenewalAt`
  - `graceEndAt` (if in grace)

- **AddonPurchase**
  - `id`
  - `storeId`
  - `type` (`MESSAGE_PACK`, `STAFF_SEAT`, `PRODUCT_PACK`, …)
  - `quantity`
  - `cycleStart`
  - `cycleEnd`
  - `status` (`active`, `expired`, `mergedIntoPlan`)
  - `kashierPaymentId`
  - `metadata` (for audit / UX if needed)

- **Usage**
  - `id`
  - `storeId`
  - `cycleStart`
  - `cycleEnd`
  - `messagesUsed`
  - `productsCount` (or `productsCreated` if needed)
  - `staffUsersCount`
  - Additional counters if needed later.

- **Payment**
  - `id`
  - `storeId`
  - `type` (`PLAN_RENEWAL`, `PLAN_UPGRADE`, `ADDON_PURCHASE`)
  - `amount`
  - `currency`
  - `kashierPaymentId`
  - `status` (`succeeded`, `failed`)
  - `createdAt`
  - References to `subscriptionId` / `addonPurchaseId` where applicable.

### 2.2 Entitlements Computation

Introduce an **`EntitlementService`** in the API that:

- Inputs:
  - `plan` (`FREE` / `PRO`)
  - Active `AddonPurchase[]` for the current cycle
  - Current `Usage` for the store’s active cycle
- Outputs:
  - `limits`:
    - `maxProducts`
    - `maxMessages`
    - `maxStaffUsers`
    - `themeCapabilities` (which themes/layouts, color palettes, etc.)
    - `brandingFlags` (branding visible/removable)
    - `inboxChannels` (FB/IG on both; future: WhatsApp, etc.)
  - `remaining`:
    - `remainingMessages`
    - `remainingProducts`
    - `remainingStaffSeats`

This service is reused:

- When building the **auth payload**.
- In core APIs that enforce limits (Inbox send, product creation, staff user creation, etc.).

---

## 3. Auth Payload & Cross-App Contract

### 3.1 Auth Payload Structure

When a merchant logs in (dashboard or storefront), the API should return an auth payload that includes:

- **Store & subscription info**
  - `storeId`
  - `merchantId`
  - `plan` (`FREE` / `PRO`)
  - `subscriptionStatus` (`active`, `grace`, `past_due`, `canceled`)
  - `billingCycleStart`
  - `billingCycleEnd`

- **Entitlements snapshot**
  - `limits` (from `EntitlementService`)
  - `remaining` (from `EntitlementService`)

- **Feature flags** (derived from plan + add-ons)
  - `canUseCustomDomain`
  - `canChangeFullThemes`
  - `canRemoveBranding`
  - `canAddStaffUsers`
  - `canUseAdvancedThemeCustomization`
  - Any other Pro-only or add-on-only capability.

### 3.2 Usage of Auth Payload

- `tijaratk-dashboard`:
  - Uses `plan`, `limits`, `remaining`, and feature flags to:
    - Show usage bars for messages, products, staff.
    - Show or lock Pro-only features (themes, custom domains, branding removal).
    - Control visibility/enabling of add-on purchase CTAs.

- `tijaratk-storefront`:
  - Uses the same payload to:
    - Enforce Free vs Pro appearance behavior (themes, layouts, branding).
    - Hide or lock custom domain settings on Free.
    - Ensure storefront is visually aligned with the active plan.

The **API still enforces all limits** regardless of what the frontend shows.

---

## 4. Usage Tracking & Limit Enforcement (API)

### 4.1 Per-Cycle Usage

- Each store has a single active `Usage` record for the current cycle:
  - `cycleStart` and `cycleEnd` match the store’s billing period.
  - Counters reset when the cycle rolls over.

- At the start of each new cycle:
  - A scheduled job:
    - Creates a new `Usage` row for the cycle.
    - Marks previous `Usage` as archived/history.
    - Expires any `AddonPurchase` where `cycleEnd` has passed.

### 4.2 Hard API Enforcement

For **every limited operation**, the API should:

1. Resolve the store’s **current plan**, active **add-ons**, and **Usage**.
2. Use `EntitlementService` to calculate `limits` and `remaining`.
3. If `remaining[resource] <= 0`:
   - Reject the request with structured error:
     - `code: "LIMIT_REACHED"`
     - `httpStatus: 402` or `403` (to be decided)
     - `context`:
       - `resource` (e.g. `"messages"`, `"products"`, `"staff"`)
       - `plan` (e.g. `"FREE"`)
       - `currentUsage`
       - `maxUsage`
       - `primaryUpgrade` (e.g. `"MESSAGE_PACK"`)
       - `secondaryUpgrade` (e.g. `"PRO"`)
4. If allowed:
   - Execute the action.
   - Increment the relevant usage counter atomically.

### 4.3 Operations that must be guarded

- **Inbox**
  - Sending a message (reply or new).
  - Potentially even reading beyond a limit in future (MVP: primarily sending).

- **Products**
  - Creating a new product.
  - (Optionally) duplicating a product.

- **Staff**
  - Creating a staff member (beyond {Free: 0 staff, Pro: 2 staff}).

---

## 5. Kashier Integration (API)

### 5.1 Checkout Session API

Create an API in `tijaratk-api` for starting Kashier checkout:

- `POST /billing/checkout/session`
  - Payload:
    - `intent`: `"UPGRADE_PLAN"` or `"BUY_ADDON"`
    - For `"UPGRADE_PLAN"`:
      - `plan: "PRO"`
    - For `"BUY_ADDON"`:
      - `addonType`: `"MESSAGE_PACK" | "STAFF_SEAT" | "PRODUCT_PACK"`
      - `quantity`: integer (default `1`)
  - Server responsibilities:
    - Compute price based on `subscription-plans.md` config.
    - Create a payment session with Kashier.
    - Return a `redirectUrl` or client token for Kashier.

### 5.2 Kashier Webhooks

Implement a webhook handler (e.g. `POST /billing/webhook/kashier`) that:

- Verifies webhook authenticity.
- Reads event type and metadata to identify:
  - `storeId`
  - `intent` (`UPGRADE_PLAN`, `BUY_ADDON`)
  - `plan` or `addonType`
  - `paymentStatus`

Behavior:

- On `payment_success`:
  - If `intent = UPGRADE_PLAN`:
    - Update or create `Subscription`:
      - `plan = PRO`
      - `status = active`
      - `billingCycleStart = now`
      - `billingCycleEnd = billingCycleStart + 1 month` (or configured period)
    - Update `Store.currentPlan = PRO`.
    - Mark any add-ons that are now redundant (e.g. product pack when Pro gives unlimited products) as `status = mergedIntoPlan`.
  - If `intent = BUY_ADDON`:
    - Create `AddonPurchase` for the **current cycle** of the store:
      - `cycleStart = current billingCycleStart`
      - `cycleEnd = current billingCycleEnd`
      - `status = active`
    - (Optional) Recompute entitlements for immediate unlock.
  - Create a `Payment` record with `status = succeeded`.

- On `payment_failed`:
  - Create a `Payment` record with `status = failed`.
  - For **renewal** failures:
    - Move subscription `status` to `grace`.
    - Set `graceEndAt`.

### 5.3 Renewal and Grace Period Logic

- On scheduled renewal attempts (Kashier-driven or API-driven):
  - Success → keep `status = active`, move `nextRenewalAt` forward.
  - Failure → `status = grace`, set `graceEndAt` (e.g. 7 days after failure).

- When `graceEndAt` passes without successful payment:
  - Set `Subscription.status = past_due` or `canceled`.
  - Downgrade `Store.currentPlan = FREE`.
  - Recalculate entitlements for Free.

---

## 6. Dashboard Integration (`tijaratk-dashboard`)

### 6.1 Billing Summary Page

Endpoint: `GET /billing/summary`

- Returns:
  - Current plan, status, cycle dates.
  - Entitlements snapshot (`limits`, `remaining`).
  - `activeAddons[]` with summary (type, quantity, expires at).
  - `paymentHistory[]` (recent `Payment` objects).

UI:

- Section: **Current Plan**
  - Card showing Free/Pro, price, next renewal date, status (including `grace`).

- Section: **Usage**
  - Progress bars:
    - Messages used vs limit.
    - Products vs limit.
    - Staff vs limit.

- Section: **Add-ons**
  - For Free plan:
    - Buttons: “Buy Extra Message Pack”, “Buy Extra Product Pack”, “Buy Extra Staff Seat”.
  - For Pro plan:
    - Show these as “Included in Pro” or “Not needed on Pro” (educational).

- Section: **Payment History**
  - Simple list of payments with status and amount.

### 6.2 Upgrade & Add-on Purchase Flows

- **Upgrade to Pro**
  - Button “Upgrade to Pro” in Billing and in upsell surfaces (themes, custom domain, etc.).
  - Calls `POST /billing/checkout/session` with `intent = UPGRADE_PLAN`.
  - Redirects to Kashier.

- **Buy Add-on**
  - From Billing page or block modals:
    - Call `POST /billing/checkout/session` with `intent = BUY_ADDON` and `addonType`.
    - Redirect to Kashier.

- After payment:
  - Dashboard can:
    - Poll `GET /billing/summary` or expose “I’ve completed payment” button to refresh state.
    - Immediately reflect new `remaining` and unlocked features.

### 6.3 Limit Reached UX (Inbox, Products, Staff)

Pattern when API returns `LIMIT_REACHED`:

- Show a **blocking modal** with:
  - Clear description:
    - Example: “You’ve reached your 50 messages/month limit on the Free plan.”
  - Usage snapshot (current vs max).
  - **Primary CTA:** Buy relevant add-on:
    - Example: “Buy Extra Message Pack (+100 messages for $2.50)”.
  - **Secondary CTA:** Upgrade to Pro:
    - “Upgrade to Pro for 3,000 messages/month + full themes.”

Implementation:

- Use error `context` fields to:
  - Drive copy (resource, plan, current vs max).
  - Determine `addonType` and Pro upsell message.

---

## 7. Storefront Integration (`tijaratk-storefront`)

### 7.1 Plan-Aware Storefront Behavior

Using the shared auth payload:

- **Free Plan**
  - Max 10 products:
    - API already enforces; storefront simply reflects existing products.
  - Theme customization:
    - Access to **20 predefined color palettes**.
    - Limited **product layout** options (list/grid/minimal).
    - No access to full themes, advanced layout options, or custom CSS.
  - Branding:
    - Tijaratk branding always visible (footer, badge, etc.).
  - Domain:
    - Store must use Tijaratk subdomain only; custom domain settings appear locked with upsell messaging.

- **Pro Plan**
  - Unlimited products (enforced by API limits).
  - Themes:
    - Unlocks **10 full themes**.
    - Typography, header/footer, hero section, sections configuration, color palette picker, basic custom CSS.
  - Branding:
    - Ability to remove Tijaratk branding.
  - Domain:
    - Custom domain configuration enabled (A record/CNAME + verification UI).

### 7.2 Always-Visible but Gated Features

- All Pro-only customization options remain visible in the UI:
  - Marked with lock icons or “Pro” labels.
  - Clicks trigger an “Upgrade to Pro” modal that navigates to the dashboard’s Billing/Upgrade flow.

---

## 8. End-to-End Flows

### 8.1 Free Merchant Hitting Inbox Message Limit

1. Merchant uses Omnichannel Inbox in the dashboard.
2. Each message sent increments `Usage.messagesUsed`.
3. Once `messagesUsed >= maxMessages` (Free base + add-ons), API rejects new sends with `LIMIT_REACHED` and `resource = "messages"`.
4. Dashboard shows a blocking modal:
   - Primary: “Buy Extra Message Pack (+100 messages for $2.50)”.
   - Secondary: “Upgrade to Pro for 3,000 messages/month + full themes”.
5. Merchant chooses:
   - **Add-on:** Dashboard calls `POST /billing/checkout/session` with `BUY_ADDON` + `MESSAGE_PACK`, redirects to Kashier.
   - **Pro:** Dashboard calls `POST /billing/checkout/session` with `UPGRADE_PLAN` + `PRO`, redirects to Kashier.
6. Kashier processes payment and calls webhook.
7. API updates `AddonPurchase` or `Subscription`, recalculates entitlements.
8. Dashboard refreshes `GET /billing/summary`, modal closes, and sends retry succeed.

### 8.2 Free → Pro Upgrade

1. Merchant sees locked features (themes/custom domain) or visits Billing and clicks “Upgrade to Pro”.
2. Dashboard calls `POST /billing/checkout/session` with `UPGRADE_PLAN`.
3. Merchant completes payment in Kashier.
4. Webhook:
   - Sets `Subscription.plan = PRO`, `status = active`.
   - Updates store `currentPlan = PRO`.
   - Sets new billing cycle start/end.
   - Marks redundant add-ons (e.g. product packs) as `mergedIntoPlan`.
5. On next auth refresh:
   - Dashboard and storefront show Pro entitlements:
     - Unlimited products.
     - 3,000 messages/month.
     - 10 full themes, custom domain, branding removal.

### 8.3 Grace Period on Failed Renewal

1. Pro subscription renewal attempt fails via Kashier.
2. Webhook sets:
   - `Subscription.status = grace`
   - `graceEndAt = now + configured days`
3. Auth payload includes `subscriptionStatus = "grace"`.
4. Dashboard shows banner: “Payment issue – X days left before downgrade.”
5. If merchant resolves payment before `graceEndAt`, status goes back to `active`.
6. If not resolved by `graceEndAt`:
   - API sets `Subscription.status = past_due` or `canceled`.
   - Downgrades `Store.currentPlan = FREE`.
   - Recomputes entitlements for Free.
   - All new limited actions now follow Free limits; if usage is already beyond Free caps, further actions are blocked until upgrade.

---

## 9. Next Steps Before Implementation

- Validate all assumptions here against:
  - `subscription-plans.md` (limits, pricing).
  - Practical Kashier API capabilities (subscription vs one-off payments).
- Finalize:
  - Exact HTTP status codes and error payload shapes for `LIMIT_REACHED`.
  - Billing cycle computation (calendar month vs “30 days from subscription start”).
  - Length of the grace period and downgrade behavior details.
- Once confirmed, implement:
  - Domain models and `EntitlementService` in `tijaratk-api`.
  - Billing/usage endpoints (`/billing/summary`, `/billing/checkout/session`, webhook handler).
  - Dashboard integrations for Billing, upgrade/add-on flows, and limit modals.
  - Storefront feature gating aligned with the auth payload.

