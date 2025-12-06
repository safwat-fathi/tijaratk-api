# Next.js Storefront Client Implementation Guide

This document describes how to implement the storefront customer experience with Next.js so buyers can discover products, place orders, and follow fulfillment steps reliably. It focuses on architectural decisions, page requirements, and supporting infrastructure that align with the existing NestJS API.

## 1. Architectural Overview

### 1.1 Application Structure

- Use Next.js App Router for file-system routing, server components, and streaming SSR.
- Organize code under `app/` with feature directories (e.g., `app/(storefront)/products`, `app/(auth)`). Co-locate page-level layouts, loading states, and error boundaries.
- Keep shared UI in `components/` and domain-specific logic in feature folders (e.g., `modules/cart`).
- Store constants, DTOs, and API clients under `lib/` to share types with the NestJS backend when possible.

### 1.2 Data Access and Caching

- Use `fetch` with the API base URL configured via environment variables; expose helper functions like `apiFetch` that automatically attach auth headers and handle errors.
- Prefer server components for data-heavy routes (catalog, product detail, order tracking) to leverage caching (ISR/SSR) and reduce client bundle size.
- Enable incremental static regeneration (ISR) for catalog-style pages where freshness tolerance is minutes; fall back to SSR for personalized or real-time screens (cart, checkout).
- Cache common queries using `react-query` or Next.js cache APIs when client-side interactivity is required (e.g., cart state, address autocomplete).

### 1.3 State Management

- Keep global state minimal: cart contents, shipping selections, payment intent metadata.
- Use Zustand for cart/session state so it persists between routes without prop drilling.
- Encode cart state on the server (cart ID) whenever possible to avoid local storage conflicts; client store should only mirror the authoritative server state.

### 1.4 Authentication and Session

- Treat storefront orders as anonymous/guest by default. Every checkout session should generate a server token tied to the customer email/phone so fulfillment can proceed without an authenticated profile.
- Implement passwordless magic links or OAuth if already supported by the API; handle login/logout with dedicated routes under `(auth)` segment for customers who choose to upgrade to full accounts.
- Use secure HTTP-only cookies for session tokens. Server components can read cookies to tailor responses; client fetches should include credentials.
- Gate protected routes (order history, saved addresses) using middleware that checks auth cookies and redirects to login when missing, but keep guest order lookup routes open via the order token + email combination.

### 1.5 Form Handling and Validation

- Use Zod or the backend DTO schemas to validate user input before submitting (addresses, payment info wrappers, profile edits).
- Display inline validation states and disable submission buttons until required data is present.

### 1.6 Observability and Error Handling

- Instrument API calls with tracing IDs passed through request headers so backend logs correlate with the frontend actions.
- Capture client errors with an APM tool (e.g., Sentry) and expose user-friendly fallback UIs via Next.js error boundaries and `not-found.tsx` components.

## 2. Page and Flow Requirements

### 2.1 Public Catalog

1. **Home / Landing (`app/page.tsx`)**
   - Personalized hero modules, featured collections, and entry points to categories.
   - Server-render featured product lists via ISR; client overlays handle quick-add actions.
2. **Category / Collection (`app/(storefront)/collections/[slug]/page.tsx`)**
   - SSR or ISR depending on category churn; supports filters (price, brand, inventory state) using query parameters and client transitions.
3. **Product Detail (`app/(storefront)/products/[slug]/page.tsx`)**
   - Server component fetches product, stock, pricing tiers, and fulfillment availability.
   - Client add-to-cart component handles quantity selection, variant choices, and fallback to waitlist if out of stock.

### 2.2 Search and Discovery

- **Search Results (`app/(storefront)/search/page.tsx`)** uses server actions to execute keyword queries and hydrates a client component for infinite scroll.
- **Recommendations** surface cross-sell/up-sell modules within product detail and cart pages using shared components.

### 2.3 Cart Experience

- **Cart Drawer / Page (`app/(storefront)/cart/page.tsx`)**
  - Client component subscribed to cart store; displays line items, discounts, tax estimate, and shipping selector.
  - Supports coupon application, gift options, and inventory validation before checkout.
- Persist cart ID in cookies; server endpoints return authoritative totals, shipping quotes, and inventory validation results.

### 2.4 Checkout Flow

1. **Customer Info (`app/(checkout)/information/page.tsx`)**
   - Collect contact, shipping address, and optional account creation. Persist the checkout session as a guest record unless the shopper explicitly opts into account creation mid-flow.
   - Validate form client-side with Zod; submit to `/checkout/sessions` API.
2. **Shipping Method (`app/(checkout)/shipping/page.tsx`)**
   - Fetch eligible shipping rates; allow user to select and save to checkout session.
3. **Payment (`app/(checkout)/payment/page.tsx`)**
   - Integrate with payment provider SDK (Stripe, etc.); handle client secret retrieval from backend, render payment element, collect billing address.
4. **Review & Submit (`app/(checkout)/review/page.tsx`)**
   - Summaries order, promotions, shipping, taxes; final confirmation triggers backend order creation.
5. **Confirmation (`app/(checkout)/confirmation/[orderId]/page.tsx`)**
   - Displays thank-you message, order status, download invoice, and next steps for fulfillment tracking.

### 2.5 Account and Order Management

- **Authentication (`app/(auth)/login`, `app/(auth)/register`)** for customers to manage saved info.
- **Account Dashboard (`app/(account)/page.tsx`)** summarizing open orders, loyalty status, saved addresses, and preferences.
- **Order History (`app/(account)/orders/page.tsx`)** with filters and deep links into individual orders. Offer a guest lookup widget that asks for order token + email so anonymous customers can self-serve without logging in.
- **Order Detail (`app/(account)/orders/[orderId]/page.tsx`)** showing items, shipment breakdown, tracking numbers, fulfillment milestones, and support actions (cancel, return, reorder). The route should accept guest tokens, hiding account-only perks when no auth session exists.
- **Profile & Addresses (`app/(account)/profile`, `app/(account)/addresses`)** for editing personal data with optimistic UI updates.

### 2.6 Support and Self-Service

- **Help Center (`app/(support)/help/page.tsx`)** with FAQ modules and contact entry points.
- **Returns & Exchanges (`app/(account)/orders/[orderId]/returns`)** using guided flows to request RMA, schedule pickup, or print labels. Guest shoppers authenticate with the same order token + email pair, so the UI must surface that input path alongside logged-in shortcuts.
- **Store Locator / Pickup Scheduling (`app/(storefront)/stores`)** if physical pickup is supported; integrate map provider and show inventory availability by location.

## 3. Order Fulfillment Experience

### 3.1 Placement to Confirmation

- After payment success, call backend order creation endpoint; backend responds with `orderId`, guest order token, fulfillment ETA, and instructions so even anonymous customers can reference their purchase.
- Trigger client notifications and optionally subscribe the user to push/email updates. Include the guest token in each message to power one-click tracking.

### 3.2 Post-Purchase Tracking

- Poll `/orders/{id}` or subscribe to WebSocket/Server-Sent Events channel for status updates (processing, packed, shipped, delivered). Guest order tokens act as bearer keys so unauthenticated browsers can fetch status securely.
- Show timeline UI within order detail page; allow users to report issues or request support at each stage, regardless of whether they signed in.

### 3.3 Returns and Modifications

- Allow order edits (address changes, cancellation) depending on fulfillment stage. Use server actions to validate eligibility and persist changes.
- Provide guided return/exchange flows with shipping label downloads; integrate with backend RMA endpoints.

### 3.4 Notifications

- Integrate with backend notification preferences so customers can opt into SMS/email/push.
- Client surfaces banners summarizing important states (awaiting payment confirmation, action required, return approved).

## 4. Implementation Approach

### 4.1 Routing and Layout Strategy

- Use nested layouts for major app segments (public, checkout, account) to keep shared UI consistent and enforce data requirements via layout-level loaders.
- Provide `loading.tsx` and `error.tsx` for each critical segment to ensure good perceived performance.

### 4.2 API Integration

- Create a typed API client module using `fetch` wrappers; reuse DTOs from the NestJS API to avoid drift.
- Centralize error mapping (HTTP status → user message) and instrumentation logging.

### 4.3 UI Components

- Even without a dedicated design system, codify primitives (buttons, inputs, modals) under `components/ui` and use composition to build domain-specific blocks (product card, cart summary, checkout stepper).
- Maintain accessibility (semantic HTML, focus management) especially for cart drawer, modals, and forms.

### 4.4 Performance Practices

- Utilize Next.js image optimization for product media.
- Lazy load non-critical sections (reviews, recommendation carousels) using dynamic imports.
- Prefetch key routes (product detail from catalog, checkout from cart) using Next.js `Link` prefetching and `router.prefetch` in client components.

### 4.5 Security

- Ensure sensitive API calls happen server-side when possible (pricing, promotions) to keep secrets off the client.
- Sanitize user-generated content (reviews, addresses) before rendering.
- Adopt Content Security Policy headers and HTTPS-only cookies.

### 4.6 Testing

- Combine unit tests for utilities/state stores with integration tests using Playwright or Cypress to validate checkout and order flows.
- Use MSW (Mock Service Worker) during development to simulate API latency and edge cases.

## 5. Delivery Checklist

- [ ] Environment variables defined for API base URL, auth endpoints, payment provider keys.
- [ ] API client library with shared DTO typings.
- [ ] Core page tree implemented with layouts and metadata.
- [ ] Cart and checkout flows fully integrated with backend endpoints.
- [ ] Order tracking and account pages handle edge cases (failed payment, partial fulfillment).
- [ ] Observability hooks configured (logging, tracing IDs, error reporting).
- [ ] End-to-end tests scripted for browse → checkout → order tracking → return.

With this structure, the Next.js storefront provides a cohesive experience that mirrors backend capabilities, keeps customers informed throughout fulfillment, and remains maintainable as the product evolves.
