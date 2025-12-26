# Orders Feature - Implementation Plan

> **Resource**: Orders
> **Action**: Implement full feature
> **Date**: 2025-12-23

This document outlines the implementation plan for the complete orders feature across API, Dashboard, and Storefront as specified in [orders.md](../orders.md).

---

## Current State Summary

### API (tijaratk-api) ✅ Partial
- `Order` and `OrderItem` entities exist
- `OrderStatus` enum: pending, confirmed, shipped, cancelled
- Controllers for authenticated and public endpoints
- Missing: payment_status, tracking_number, delivered status, internal notes

### Dashboard (tijaratk-dashboard) ✅ Partial
- Orders list page with filtering and pagination
- Status badges and basic info display
- Missing: Order details page, seller actions (mark paid/shipped/delivered)

### Storefront (tijaratk-storefront) ⚠️ Incomplete
- Order lookup by ID exists (Server Side Page)
- Product pages have "Add to Cart" button (non-functional)
- Missing: Cart system, checkout flow, order creation

---

## Phase 1: MVP Implementation

### 1.1 API Enhancements

#### Order Entity Updates
Add new fields to `order.entity.ts`:
- `payment_status` enum (unpaid/paid) 
- `tracking_number` varchar nullable
- `internal_notes` text nullable
- `delivered_at` timestamp nullable
- `order_type` enum (catalog/custom)

#### New API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/storefronts/:id/orders/:orderId/mark-paid` | Mark order as paid (COD collected) |
| PATCH | `/storefronts/:id/orders/:orderId/mark-shipped` | Mark as shipped with optional tracking |
| PATCH | `/storefronts/:id/orders/:orderId/mark-delivered` | Mark as delivered, set timestamp |
| PATCH | `/storefronts/:id/orders/:orderId/notes` | Update internal notes |

#### Database Updates
Update entities to reflect new columns. **Note: Skipping manual migration creation as requested.**

---

### 1.2 Dashboard Enhancements

#### Order Details Page
New page at `/orders/:orderId`:
- Full order info display
- Shipping address
- Order items with products
- Action buttons for status changes
- Internal notes field
- Order timeline

#### Orders List Updates
- Add payment status badge
- Clickable rows to order details
- Quick "Mark as Paid" action

---

### 1.3 Storefront Cart & Checkout

#### Cart System
- **Zustand** store for state management (client-side persistence)
- Cart drawer component
- Header cart button with count

#### Checkout Flow
- New checkout page at `/[slug]/checkout`
- Buyer info form
- Shipping address form
- Order submission (Server Action)
- Confirmation page

---

## File Changes Summary

### API (14 files)
- MODIFY: `order.entity.ts` - Add new fields
- MODIFY: `orders.service.ts` - Add new methods
- MODIFY: `orders.controller.ts` - Add new endpoints
- NEW: `update-order-tracking.dto.ts`
- NEW: `update-order-notes.dto.ts`
- *Skipped Migration File*

### Dashboard (5 files)
- NEW: `pages/OrderDetails.tsx`
- MODIFY: `pages/Orders.tsx`
- MODIFY: `App.tsx` - Add route
- NEW: `services/orders.service.ts`
- MODIFY: i18n translations

### Storefront (10 files)
- NEW: `app/actions/cart.ts`
- NEW: `store/cart-store.ts` (Zustand)
- NEW: `components/cart/cart-drawer.tsx`
- NEW: `components/cart/cart-button.tsx`
- NEW: `types/models/cart.ts`
- NEW: `app/(storefronts)/[slug]/checkout/page.tsx`
- NEW: `app/(storefronts)/[slug]/checkout/confirmation/page.tsx`
- MODIFY: `components/product/product-info.tsx`
- MODIFY: `components/orders/orders-lookup.tsx`

---

## Phase 2: Guest Support (Future)
- Guest entity with WhatsApp verification
- Guest/customer_id on orders
- OTP verification flow

## Phase 3: Magic Links (Future)  
- OrderAccessToken entity
- Token generation/validation
- WhatsApp integration

## Phase 4: Custom Orders (Future)
- Custom order request flow
- Quote management
- Request → Order conversion

---

## Questions for Review

1. **Scope**: Confirm Phase 1 MVP scope before implementation
2. **Delivery Status**: Should we add a "delivered" status to the enum, or just use `delivered_at` timestamp with "shipped" status?
3. **Cart Storage**: Cookie-based vs localStorage - cookies work with SSR but have size limits
4. **Order Types**: Implement `order_type` enum now for future custom orders, or add later?
