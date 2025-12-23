# ✅ **Tijaratk Order Plan**

### _(Catalog Orders + Custom Orders + Guest Customers + WhatsApp Magic Links)_

This document defines the **complete order lifecycle and actions model** in Tijaratk, designed for:

- Facebook / Instagram / WhatsApp commerce
- Omnichannel Inbox workflows
- Guest-first ordering
- COD-only payments (Phase 1)
- Minimal friction & minimal refactoring

---

## 🧩 **1. Order Types**

| Order Type        | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| **Catalog Order** | Created from existing products                                          |
| **Custom Order**  | Created after seller approves a customer request for a non-catalog item |

> **Custom Orders are negotiated first, then converted into Orders**
> They are **not products** and do **not affect catalog or inventory logic**.

---

## 👤 **2. Customer Identity Model**

### 2.1 Registered Customer

- Has account
- Orders linked to `customer_id`

### 2.2 Guest Customer (MVP – Fully Supported)

> **A guest is an identity, not an account**

### ✅ Guest Requirements (Mandatory)

- **WhatsApp number (required)**
- OTP verification (once)

```ts
guest {
  id
  whatsapp_number   // required
  verified_at
}
```

Orders & requests reference:

```ts
order {
  customer_id?   // registered
  guest_id?      // guest
}
```

Applies to:

- `orders`
- `custom_order_requests`
- `custom_order_quotes`

---

## 🔐 **3. Guest Access via WhatsApp Magic Links (Core Feature)**

> **The link itself is the authentication**

Guests manage orders **without login** using **secure WhatsApp URLs**.

### 3.1 How It Works

1. Guest places catalog order OR requests custom order
2. System sends WhatsApp message with secure URL
3. Guest clicks link
4. Backend validates token
5. Guest lands on order page (track / update)

---

### 3.2 Token Model

```ts
order_access_token {
  id
  order_id
  guest_id
  token_hash        // stored hashed
  scope             // view | update
  expires_at
  revoked_at?
}
```

- Tokens are **single-order**
- Time-limited
- Revocable

---

### 3.3 Allowed Guest Actions via Link

✅ View order details
✅ Track order status
✅ View shipment info
✅ Request address change
✅ Request cancellation (if allowed)
✅ Contact seller

❌ No price edits
❌ No item edits
❌ No access to other orders

---

### 3.4 Expiration & Recovery

| Case                  | Rule                       |
| --------------------- | -------------------------- |
| Default link validity | 24 hours                   |
| Expired link          | New link sent via WhatsApp |
| Suspicious activity   | Token revoked              |

Guests can always request:

> “Resend order link”

---

## 🛒 **4. Payment Model (Phase 1)**

### ✅ **Cash on Delivery (COD) ONLY**

- No online payments
- No payment gateways
- No deposits

Order payment status:

```
unpaid → paid (COD collected)
```

Seller marks order as paid manually.

---

## 🧱 **5. Customer Actions**

### A. Before Order Exists (Custom Orders Only)

#### **1. Request Custom Order**

Customer submits:

- Description
- Quantity
- Optional budget
- Reference images
- WhatsApp number (if guest)

Status flow:

```
pending → quoted → accepted | rejected | expired
```

---

### B. Before Order Fulfillment

#### **2. Place Catalog Order**

- Add products to cart
- Submit order
- WhatsApp verification required for guests

---

#### **3. Accept / Reject Custom Order Quote**

Customer can:

- Accept → **Order is created**
- Reject
- Request changes (via Inbox)

---

#### **4. Cancel Order**

Allowed:

- Before seller confirmation
- Before shipping
- Based on seller policy

> Custom Orders may be non-cancelable after confirmation.

---

#### **5. Track Order**

Via:

- WhatsApp magic link
- Order status page

Statuses:

```
pending → confirmed → shipped → delivered
```

---

#### **6. Contact Seller**

- Omnichannel Inbox
- Clarify delivery or custom details

---

### C. After Fulfillment

#### **7. Confirm Delivery** (Optional)

Manual confirmation if courier is not integrated.

---

#### **8. Request Return / Refund**

- Report defect
- Request refund

> Custom Orders can be **non-returnable**.

---

#### **9. Leave Feedback / Rating**

- Rate seller
- Rate order

---

#### **10. Reorder**

- Catalog orders → add to cart
- Custom orders → creates new request

---

## 🚀 **6. Seller Actions**

### A. Custom Order Management

#### **1. View Custom Order Requests**

- Filter by status
- View guest / customer history

---

#### **2. Quote Custom Order**

Seller sets:

- Price
- Delivery time
- Notes
- Quote expiry

---

#### **3. Accept / Reject Custom Request**

- Accept → waits for customer approval
- Reject → optional reason

---

#### **4. Convert Custom Request to Order**

Triggered automatically when customer accepts quote.

---

### B. Order Processing

#### **5. View Orders**

Unified list:

- Catalog + Custom
- Guest + Registered

Filters:

- Order type
- Status
- Channel
- Guest / user

---

#### **6. Manually Create Order**

For:

- WhatsApp orders
- Phone orders
- Offline deals

---

#### **7. Confirm Order**

- Validate availability / feasibility
- Lock order details

---

#### **8. Edit Order**

Seller can:

- Edit description
- Adjust quantities
- Update shipping cost
- Update customer info

> All edits are logged.

---

#### **9. Add Internal Notes**

Visible to seller only.

---

### C. Payment (COD)

#### **10. Mark as Paid**

Used when:

- COD collected
- POS collected offline

---

### D. Fulfillment & Shipping

#### **11. Mark as Ready for Shipping**

---

#### **12. Mark as Shipped**

- Add tracking number
- Select courier

---

#### **13. Mark as Delivered**

Manual override if needed.

---

#### **14. Mark as Failed Delivery**

- Customer unavailable
- Refused delivery

---

### E. Cancellation & Returns

#### **15. Cancel Order**

Reasons:

- Customer request
- Out of stock
- Cannot fulfill custom order

---

#### **16. Refund Order**

Manual refund handling (offline).

---

### F. Operations & Intelligence

#### **17. Add Tags**

Examples:

- Guest order
- Custom order
- High value
- Facebook lead

---

#### **18. Export Orders**

- CSV / Excel
- Accounting
- Courier usage

---

#### **19. Fraud Review**

Rule-based:

- Repeated COD refusals
- High-risk delivery zones
- Abusive custom requests

---

## ⏳ **7. Pending & Expiration Rules**

### Custom Orders

| Stage                  | Expiry       |
| ---------------------- | ------------ |
| Pending request        | 48–72 hours  |
| Quoted (no response)   | Quote expiry |
| Accepted (unconfirmed) | 24 hours     |

---

### Catalog Orders

| Stage                 | Expiry         |
| --------------------- | -------------- |
| Pending confirmation  | Seller-defined |
| Ready but not shipped | Seller-defined |

Expired orders:

- Auto-cancelled
- Logged for analytics

---

## 🔁 **8. Guest → Registered User Upgrade**

When a guest registers with the **same WhatsApp number**:

```sql
UPDATE orders
SET customer_id = user.id
WHERE guest_id = guest.id
```

- Full order history preserved
- No duplication
- Seamless upgrade

---

## 🧱 **9. MVP Scope Summary**

### Customer (MVP)

- Request custom order
- Accept / reject quote
- Place catalog order
- Track order via WhatsApp link
- Request cancellation
- Contact seller
- View order details

### Seller (MVP)

- View custom requests
- Quote custom orders
- Convert request → order
- View & filter orders
- Confirm order
- Edit order
- Cancel order
- Mark as paid (COD)
- Mark as shipped
- Mark as delivered
- Add internal notes
- Export orders
