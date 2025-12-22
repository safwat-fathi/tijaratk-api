Below is a **clear business + technical approach** for allowing **Users and Guests** to place orders on **Tijaratk** storefronts (Facebook-first SaaS -> Omnichannel → Storefront → Cart → Checkout).

---

# ✅ **Business Perspective**

## **1. Why allow Guest Checkout?**

Guest checkout significantly increases conversion rates, especially for:

- Impulse buys
- Facebook traffic (coming from posts / comments)
- Customers who don’t want to create accounts
- Small merchants with low-friction buying experience

**Impact:**
✔ Higher storefront conversion
✔ Lower cart abandonment
✔ Essential for merchants selling through social media

**Recommendation:**
👉 **Offer guest checkout by default**, but give sellers the option to disable it.

---

## **2. User Accounts still matter**

Users with accounts get:

- Order history
- Saved addresses
- Faster checkout
- Tracking updates in email / WhatsApp / Inbox
- Personalized recommendations (future)

This increases:

- Retention
- Repeat purchase frequency
- CLV (Customer Lifetime Value)

**Recommendation:**
👉 Keep Accounts optional, but incentivize registration after the purchase (post-checkout conversion).

---

## **3. Respect Seller Preferences**

Each seller chooses:

- Allow Guest Checkout: **Yes/No**
- Require phone number: **Yes/No**
- Require email: **Yes/No**
- Require address at checkout: **Full / Partial / After-confirmation**

---

# 📐 **Technical Architecture**

## **🔹 1. Order Model (Core)**

You will treat orders as standalone entities NOT tied to user accounts.

### **Order fields**

```ts
Order {
  id
  seller_id
  buyer_id (nullable)
  buyer_type: "guest" | "registered"
  items: OrderItem[]
  total_price
  status: pending | confirmed | shipped | completed | cancelled

  // Guest info
  guest_name
  guest_email
  guest_phone

  // Shared info
  shipping_address
  payment_method
  created_at
}
```

**Key principle:**
👉 **An order must exist regardless of authentication.**

---

## **🔹 2. Guest Checkout Flow** (recommended)

### **Flow**

1. Guest adds items to cart (no login)
2. Frontend stores cart in:
   - localStorage (browser)
   - OR server cart session (optional)

3. When they click checkout:
   - Ask for Name
   - Phone (required for COD or WhatsApp validation)
   - Email (optional)
   - Address (seller decides if required)

4. Order is created with `buyer_id = null`
5. Order confirmation message sent to:
   - Email
   - Phone (SMS/WhatsApp)
   - Seller’s Omnichannel Inbox inside Tijaratk

---

## **🔹 3. Registered User Checkout Flow**

1. User logs in → Cart linked to user
2. Saved addresses auto-filled
3. Order saved with `buyer_id = user.id`
4. User can view all orders in dashboard

---

## **🔹 4. Handling Cart for Both Types**

### Stateless Cart (Recommended for MVP)\*\*

- Cart stored in `localStorage`
- At checkout, post cart to API
- Simple and fast
- Perfect for social-media-driven stores

---

## **5. Linking Guest Orders to Accounts**

When a guest creates an order and later signs up with the same email or phone:

```
cron or webhook:
If user.email == order.guest_email:
    attach order to user.account
```

This encourages post-purchase registration and builds full customer history.

---

# 🧩 **Business + Technical Best Model for Tijaratk**

## **Final Recommended Approach**

### ✔ Allow both User and Guest orders

### ✔ Orders stored independently (user optional)

### ✔ Lightweight guest flow to boost conversion

### ✔ Auto-link guest orders if they register later

### ✔ Flexible seller-level settings

---
