# 🗂️ **Tijaratk Storefront Category System Documentation**

## **Version**

* **v1.0**
* **Last Updated:** 2025-12-12
* **Status:** Approved for Implementation

---

# **1. Overview**

The **Storefront Category System** defines how merchants classify their stores during signup and later within their dashboard.

This classification is used to:

* Improve **SEO** for store pages
* Enhance **storefront browsing & discovery**
* Enable upcoming **recommendation engines**
* Provide better context for **social commerce sellers**
* Organize storefront pages in a consistent manner

The system is intentionally **simple** but **flexible**, based on a two-level hierarchy:

```
Category → Sub-category
```

Merchants must select:

* **One Primary Category (required)**
* **One Secondary Category (optional)**
* **Sub-categories** can be:

  * Selected from suggested predefined options
  * Or **created as custom sub-categories**

---

# **2. Design Principles**

### ✔ Simplicity

Signup must remain lightweight. The merchant chooses one main category and optionally one secondary.

### ✔ Flexibility

Sub-categories can be added manually so sellers can represent niche verticals.

### ✔ SEO Friendly

Categories are used in store metadata, URLs, and structured data.

### ✔ Consistency

A predefined global list ensures browsing feels unified across Tijaratk.

### ✔ Localization

Every category has **English + Arabic** labels.

---

# **3. Category Structure**

The platform uses **14 predefined top-level categories**.
Each category provides **recommended sub-categories**, but merchants may add their own.

---

# **4. Predefined Categories & Suggested Sub-categories**

Below is the full system, with **English + Arabic** labels.

---

## **1. Fashion & Clothing — (الأزياء والملابس)**

**Suggested Sub-categories:**

* Women’s Clothing — ملابس حريمي
* Men’s Clothing — ملابس رجالي
* Kids & Baby Clothing — ملابس أطفال
* Modest Wear / Hijab — ملابس محجبات
* Sportswear — ملابس رياضية
* Accessories — إكسسوارات

---

## **2. Shoes, Bags & Accessories — (الأحذية والشنط والإكسسوارات)**

**Suggested Sub-categories:**

* Women’s Shoes — أحذية حريمي
* Men’s Shoes — أحذية رجالي
* Kids Shoes — أحذية أطفال
* Handbags — شنط حريمي
* Backpacks — حقائب ظهر
* Wallets — محافظ
* Watches & Jewelry — ساعات ومجوهرات

---

## **3. Beauty & Personal Care — (الجمال والعناية الشخصية)**

**Suggested Sub-categories:**

* Skin Care — العناية بالبشرة
* Makeup — مكياج
* Hair Care — العناية بالشعر
* Perfumes — عطور
* Personal Hygiene — العناية الشخصية
* Beauty Tools — أدوات التجميل

---

## **4. Home & Living — (المنزل والمعيشة)**

**Suggested Sub-categories:**

* Home Decor — ديكور
* Kitchen Tools — أدوات مطبخ
* Bedding — مفروشات
* Storage & Organization — تخزين وتنظيم
* Handmade Home Items — ديكور يدوي
* Small Furniture — أثاث صغير

---

## **5. Electronics & Gadgets — (الإلكترونيات والأجهزة)**

**Suggested Sub-categories:**

* Mobile Accessories — إكسسوارات موبايل
* Smart Devices — أجهزة ذكية
* Headphones & Audio — سماعات وصوتيات
* Computer Accessories — إكسسوارات كمبيوتر
* Gaming Accessories — إكسسوارات ألعاب
* Wearables — ساعات ذكية

---

## **6. Jewelry & Accessories — (المجوهرات والإكسسوارات)**

**Suggested Sub-categories:**

* Silver — فضة
* Gold-Plated — ذهب صيني
* Custom Name Jewelry — اسماء مخصصة
* Handmade Jewelry — مجوهرات يدوية
* Fashion Jewelry — إكسسوارات

---

## **7. Handmade & Crafts — (المنتجات اليدوية والحرف)**

**Suggested Sub-categories:**

* Crochet — كروشيه
* Resin Art — ريزن
* Custom Gifts — هدايا مخصصة
* Art Prints — لوحات فنية
* Pottery — خزف
* Handmade Decor — ديكور يدوي

---

## **8. Food & Beverages — (الأطعمة والمشروبات)**

**Suggested Sub-categories:**

* Homemade Food — أكل بيتي
* Desserts — حلويات
* Healthy Foods — أكل صحي
* Coffee & Drinks — مشروبات
* Spices — توابل
* Snacks — سناكس

---

## **9. Kids & Baby — (الأطفال والرضع)**

**Suggested Sub-categories:**

* Baby Essentials — مستلزمات رضع
* Toys — ألعاب
* Kids Clothing — ملابس أطفال
* School Supplies — مستلزمات مدارس
* Party Supplies — مستلزمات حفلات

---

## **10. Fitness & Health — (اللياقة والصحة)**

**Suggested Sub-categories:**

* Supplements — مكملات غذائية
* Gym Gear — أدوات رياضية
* Sports Equipment — معدات رياضية
* Healthy Snacks — وجبات صحية

---

## **11. Pets — (الحيوانات الأليفة)**

**Suggested Sub-categories:**

* Pet Food — طعام الحيوانات
* Pet Accessories — مستلزمات الحيوانات
* Pet Care — العناية بالحيوانات
* Birds / Aquarium — طيور وأسماك

---

## **12. Automotive — (السيارات وملحقاتها)**

**Suggested Sub-categories:**

* Car Accessories — إكسسوارات سيارات
* Car Care — العناية بالسيارة
* Oils & Tools — زيوت وأدوات

---

## **13. Books & Stationery — (الكتب والأدوات المكتبية)**

**Suggested Sub-categories:**

* Books — كتب
* Notebooks — دفاتر
* Art Supplies — أدوات رسم
* Office Supplies — مكتبيات

---

## **14. Services — (الخدمات)**

**Suggested Sub-categories:**

* Graphic Design — تصميم جرافيك
* Photography — تصوير
* Marketing — تسويق
* Fitness Coaching — تدريب
* Beauty Services — خدمات تجميل
* Tailoring — تفصيل وخياطة

---

# **5. Custom Sub-categories**

### Merchants may create **custom sub-categories**.

### Rules:

* Max length: **30 characters**
* Support both English or Arabic
* Must belong to one of the predefined categories
* Cannot create new primary categories
* Must be unique within the store
* Cannot contain profanity or restricted content

### Examples:

* Category: Fashion → Sub-category (custom): *"Evening Dresses"*
* Category: Food → Sub-category (custom): *"Keto Meals"*

---

# **6. Category Selection Flow (Signup)**

### **Step 1: Select Primary Category (Required)**

Merchant chooses from the 14 predefined categories.

### **Step 2: Select Secondary Category (Optional)**

Merchant can choose 1 additional category. Optional but recommended for SEO.

### **Step 3: Add Sub-categories**

* Shows recommended sub-categories
* Merchant can select or add custom ones
* Minimum: 0
* Maximum: 10

---

# **7. SEO Usage**

The category system affects:

### **1. Store Page Title**

`{Store Name} | {Primary Category} | Tijaratk`

### **2. Store Meta Description**

Describes store category in both languages.

### **3. Store URL Structure**

Optional future enhancement:
`https://tijaratk.com/stores/fashion/brand-name`

### **4. Structured Data (JSON-LD)**

Used for Google Search indexing.

### **5. Category-Based Store Browsing**

For marketplace-style explore page.

---

# **8. Database Schema (Recommended)**

### **Table: categories**
 
 | Field   | Type   | Description                                  |
 | ------- | ------ | -------------------------------------------- |
 | id      | int    | Primary key                                  |
 | key     | string | machine-readable key: `fashion`, `beauty`, … |
 | name_en | string | category name EN                             |
 | name_ar | string | category name AR                             |
 
 ---
 
 ### **Table: storefront_category**
 
 Stores the relationship between a storefront and their selected category.
 
 | Field                 | Type | Description      |
 | --------------------- | ---- | ---------------- |
 | id                    | int  | PK               |
 | storefront_id         | int  | FK to storefront |
 | primary_category_id   | int  | required         |
 | secondary_category_id | int  | optional         |
 
 ---
 
 ### **Table: sub_categories**
 
 | Field         | Type    | Description               |
 | ------------- | ------- | ------------------------- |
 | id            | int     | PK                        |
 | storefront_id | int     | FK                        |
 | category_id   | int     | FK                        |
 | name          | string  | English / Arabic / custom |
 | is_custom     | boolean | default false             |

---

# **9. API Requirements**

Follows the same API requirements as the storefronts module and assigned category and sub-category on storefront creation.

### **GET /categories**

Return all predefined categories + suggested sub-categories.

---

# **10. Localization**

All categories & sub-categories should be available in:

* English
* Arabic
* RTL layout for Arabic in the UI

Example JSON block:

```json
{
  "fashion": {
    "en": "Fashion & Clothing",
    "ar": "الأزياء والملابس"
  }
}
```

---

# **11. Future Enhancements (Phase 2)**

* Category-based recommendations
* Personalized home feeds
* Trending stores per category
* Auto-detect category from product AI
* Multi-language SEO keywords per category

---

# **12. Summary**

The category system provides a **simple, scalable, SEO-friendly** way for Tijaratk merchants to classify their store and improve discovery.
It is optimized for **Egyptian social sellers**, providing structure without restricting creativity.

