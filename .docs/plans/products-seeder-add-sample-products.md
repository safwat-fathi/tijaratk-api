# Summary
- `src/common/seed.ts` currently seeds only the subscription plans, so no sample catalog data exists although TypeORM repositories and the seeding entry point are already set up.
- `Product` entities (`src/products/entities/product.entity.ts`) require fields like `name`, `sku`, `slug`, `price`, `stock`, `status`, and a `user` relation, meaning a seeder must either reference an existing user or create one before inserting products.

# Plan
1. **Modularize the seeding workflow**: Introduce a dedicated `seedProducts` helper (e.g., under `src/products/products.seed.ts`) that receives the initialized `DataSource`, so different seed steps remain isolated while sharing the same DB connection used in `src/common/seed.ts`.
2. **Ensure a user exists for product ownership**: Within the product seeder, fetch the first available user; if none exist, create a lightweight demo user tied to an existing subscription (e.g., the "Free" plan seeded earlier). This satisfies the `ManyToOne` constraint without forcing manual setup.
3. **Generate ten product records**: Build an array of 10 objects that align with the `Product` entity (unique names/slug per user, optional SKU, price, stock, status). Reuse simple helper functions for slugs and price/stock variation to keep data realistic while remaining deterministic.
4. **Wire everything together**: Update `src/common/seed.ts` to call the new `seedProducts` after the subscription seeding completes, logging success/failure for each phase and ensuring the connection is destroyed in `finally` as today.

# Questions / Risks
- Assumes it is acceptable to create a demo user when none exist so the products have an owner; please confirm or let me know if the products should attach to a specific existing user instead.
