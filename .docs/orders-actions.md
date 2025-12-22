# ✅ **Order Actions in Tijaratk (Catalog + Custom Orders)**

This document defines the **complete set of actions** that **customers** and **sellers** can perform on orders in Tijaratk, aligned with:

- Social commerce workflows
- Omnichannel Inbox
- Custom Orders (non-catalog items)
- Industry standards (Shopify, WooCommerce, Facebook Shops, TikTok Shop)

> **Important Principle**
> **Custom Orders are negotiated first, then converted into Orders**
> They are **not products** and do **not pollute catalog logic**.

---

# 🧩 **Order Types in Tijaratk**

| Type              | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| **Catalog Order** | Order created from existing products                                          |
| **Custom Order**  | Order created after seller approves a customer request for a non-catalog item |

All actions below apply to **both types**, unless explicitly stated.

---

# ✅ **1. Customer Actions**

## **A. Before Order Exists (Custom Orders Only)**

### **1. Request Custom Order**

Customer can submit a request containing:

- Description of requested item
- Quantity
- Optional budget
- Reference images/files

Status:

```
pending → quoted → accepted | rejected | expired
```

> This happens **before** any order is created.

---

## **B. Before Order is Fulfilled**

### **2. Place Order (Catalog Orders)**

- Add items to cart
- Submit order with customer details

---

### **3. Approve Custom Order Quote (Custom Orders)**

After seller sends a quote, customer can:

- Accept quote → **Order is created**
- Reject quote
- Request changes (via chat)

---

### **4. Cancel Order**

Allowed only:

- Before seller confirmation
- Before shipping
- According to seller policy

> For Custom Orders, cancellation rules may be stricter due to made-to-order nature.

---

### **5. Request Order Modification (Limited)**

Customer can request (via UI or Inbox):

- Change address
- Change phone number
- Edit quantities
- Replace/remove item
- Change payment method

> Always a **request**, seller decides.

---

### **6. Pay for Order**

- Online payment
- Cash on Delivery (COD)
- Partial payment / deposit (optional)

---

### **7. Track Order**

- View order status:

```
pending → confirmed → shipped → delivered
```

- View tracking link (if supported)

---

### **8. Contact Seller**

- Chat via Omnichannel Inbox
- Clarify delivery or custom requirements
- Upload missing info

---

### **9. Upload Proof of Payment** (Optional)

Common in MENA markets (bank transfer / wallet).

---

## **C. After Order is Fulfilled**

### **10. Confirm Delivery** (Optional)

Manual confirmation if courier integration is missing.

---

### **11. Request Return / Refund**

- Report defect
- Request refund
- Return item(s)

> Custom Orders may be **non-returnable**, configurable per seller.

---

### **12. Leave Feedback / Rating**

- Rate seller
- Rate order
- Optional photos

---

### **13. Reorder**

- Reorder catalog items
- Reorder previous custom order (as a new request)

---

# 🚀 **2. Seller Actions**

## **A. Custom Order Management (New)**

### **1. View Custom Order Requests**

- List & filter requests
- See customer history

---

### **2. Quote Custom Order**

Seller can:

- Set price
- Set delivery time
- Add notes
- Set expiration

---

### **3. Accept / Reject Custom Request**

- Accept → customer approval required
- Reject → optional reason

---

### **4. Convert Custom Request to Order**

Triggered when customer accepts quote.

---

## **B. Order Processing Actions**

### **5. View Orders**

- Unified list (Catalog + Custom)
- Filter by:
  - Order type
  - Status
  - Payment
  - Channel (Facebook, Instagram, etc.)

---

### **6. Manually Create Order**

For:

- Phone orders
- WhatsApp orders
- Offline agreements

---

### **7. Confirm Order**

- Validate stock or feasibility
- Lock order details

---

### **8. Edit Order**

Seller can:

- Edit items / description
- Adjust quantities
- Update price
- Add discounts
- Edit shipping cost
- Edit customer info

> For Custom Orders, edits are tracked for dispute protection.

---

### **9. Add Internal Notes**

Visible only to seller.

---

## **C. Payment Actions**

### **10. Mark as Paid**

- COD collected
- Bank transfer received
- POS payment
- Manual invoice

---

### **11. Send Payment Link**

Via Omnichannel Inbox.

---

### **12. Record Partial Payment** (Optional)

For deposits or milestones.

---

## **D. Fulfillment / Shipping Actions**

### **13. Mark as Ready for Shipping**

---

### **14. Mark as Shipped**

- Add tracking number
- Select courier

---

### **15. Mark as Delivered**

Manual override if courier doesn’t sync.

---

### **16. Mark as Failed Delivery**

- Customer unavailable
- Refused delivery

---

## **E. Cancellation / Returns**

### **17. Cancel Order**

Reasons:

- Out of stock
- Unable to fulfill custom request
- Customer request
- Duplicate order

---

### **18. Refund Order**

- Full refund
- Partial refund

---

### **19. Accept / Reject Return Request**

Configurable per order type.

---

## **F. Operational & Intelligence Actions**

### **20. Add Tags**

Examples:

- High value
- Custom order
- VIP customer
- From Facebook Ad

---

### **21. Export Orders**

- CSV / Excel
- Accounting
- Courier integrations

---

### **22. Fraud Review**

Rule-based checks:

- Repeated COD cancellations
- High-risk zones
- Suspicious custom requests

---

# 🧱 **3. Suggested Actions for Tijaratk MVP (Updated)**

## **Customer (MVP)**

- Request custom order
- Accept / reject quote
- Place catalog order
- Cancel order (if pending)
- Track order
- Change address
- Contact seller
- View order details

---

## **Seller (MVP)**

- View custom order requests
- Quote custom orders
- Convert request to order
- View & filter orders
- Confirm order
- Edit order
- Cancel order
- Mark as paid
- Mark as shipped
- Mark as delivered
- Add internal notes
- Chat with customer
- Export orders

---
