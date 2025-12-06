# Storefront Feature Plan

> Hint: After every task completion, make sure to mark it as done in the plan.

## Phase 1 – Core Domain & API Design

- Define domain ownership: enforce exactly one `Storefront` per `User`, so ownership is strictly one-to-one.
- Decide how storefronts expose products: reuse existing `Product` entities, with a clear scoping rule (for example, the store shows only products owned by that storefront’s user and marked as “published”).
- Update the `Product` entity to include `sku` and `slug` fields so products can be uniquely identified and exposed via clean storefront URLs.
- Design a minimal `Order` model: includes buyer contact info (name, email, phone), shipping details (address, city, country, and so on), ordered items (product id, quantity, price at time of order), and order status (for example, `pending`, `confirmed`, `shipped`, `cancelled`).
- Define the anonymous ordering principle: shoppers never need an account, and the system never issues customer-specific tokens—every order instead receives a unique `order_id` (generated as a public-safe random string) that becomes the sole identifier a shopper can use to look up status.
- Shape NestJS modules and boundaries:
  - `StorefrontsModule` for storefront configuration, ownership, SEO, and tracking.
  - Reuse `ProductsModule` for catalog exposure, with a service method like `findForStorefront(storefrontId, filters)`.
  - Extend or add `OrdersModule` for anonymous storefront orders.
- Draft API surface:
  - Owner (authenticated) APIs: create/update storefront, configure SEO, tracking, and theme.
  - Public (unauthenticated) APIs: get storefront by slug, list products, get product detail, and create orders using the minimal `Order` model.

## Phase 2 – SEO, Tracking, and Checkout Flow

- SEO and URL strategy:
  - Decide URL layout, such as `/:storefrontSlug` and `/:storefrontSlug/:productSlug`.
  - Define SEO fields on `Storefront` and `Product`, including SEO title, meta description, OG image, canonical URL, and index/noindex flags.
  - Ensure responses provide enough data for the frontend to generate meta tags, social share data, and structured data (for example, JSON-LD for products).
- Tracking configuration:
  - Add `TrackingConfig` fields on `Storefront`: `facebookPixelId`, `googleAnalyticsMeasurementId`, and `trackingEnabled` flags.
  - Owner APIs to set or update these IDs; public APIs expose them to the storefront frontend.
- Themes and layout configuration:
  - Define a `themeConfig` on `Storefront` (for example, colors, typography, layout style).
  - Decide how the storefront frontend consumes this config to render different layouts and styles.
- Checkout and minimal order flow:
  - Define DTOs for anonymous order creation, including cart line items, contact and shipping details, and optional notes.
  - Ensure order tracking depends exclusively on the generated `order_id`; when a shopper submits an order, immediately send the `order_id` via email/SMS and require it for all subsequent status queries.
  - Design validation and basic abuse protections, such as rate limiting hooks, maximum items per order, and required contact fields.
  - Decide how orders integrate with existing fulfillment and notifications (for example, trigger notifications to the store owner).

### Owner order management and protections (extension)

- Owner-facing order listing:
  - Add a DTO (for example, `ListOrdersDto`) that supports pagination and filters such as `status`, `created_from`, `created_to`, `buyer_name`, `buyer_email`, and `buyer_phone`, along with sort options (for example, `sort_by` and `sort_order`).
  - Expose authenticated endpoints for store owners to list and retrieve orders per storefront.
- Order status management:
  - Add endpoints for accepting and rejecting orders and for updating order status generically (for example, `pending`, `confirmed`, `shipped`, `cancelled`), with basic transition rules.
- Rate limiting and spam/fraud rules:
  - Apply rate limiting to public order creation (`POST /public/storefronts/:slug/orders`) with a policy of a maximum of 5 orders per 10 minutes per IP.
  - Implement simple spam/fraud checks in order creation, including:
    - Using `buyer_phone` as the main identifier for detecting repeated orders in a short time window (since email is optional).
    - Enforcing a minimum total order amount and caps on items per order and per-item quantity.

## Phase 3 – Performance, Security, and Rollout

- Performance and caching:
  - Identify which endpoints are cacheable, such as public GETs for storefront and products.
  - Plan cache strategy using HTTP cache headers or internal caching in services.
  - Ensure queries are efficient and avoid N+1 issues when resolving storefront and products together.
- Security and multi-tenancy:
  - Enforce strict scoping by `storefrontId` and `userId` for all owner operations.
  - Ensure public endpoints never leak internal fields, such as cost, margins, or internal notes.
  - Plan rate limiting and input hardening on order creation and search.
- Advanced capabilities:
  - Plan support for custom domains for storefronts (for example, `store-owner-domain.com` pointing to their Tijaratk storefront).
  - Design richer analytics for store owners (for example, basic dashboards built on top of tracking data and orders).
  - Improve spam and fraud protection on orders (for example, captchas, IP-based throttling, simple fraud rules).
- Implementation milestones and rollout:
  - Milestone 1: basic storefront, product listing, and minimal order model wired, without tracking.
  - Milestone 2: SEO fields and URL scheme finalized, with tracking configuration available through the API.
  - Milestone 3: performance tuning, security hardening, and beta rollout to a subset of users.
