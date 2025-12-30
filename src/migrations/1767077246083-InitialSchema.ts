import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1767077246083 implements MigrationInterface {
  name = 'InitialSchema1767077246083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "price" integer NOT NULL, "billing_cycle" character varying NOT NULL DEFAULT 'monthly', "max_products" integer, "max_posts_per_month" integer, "max_messages_per_month" integer, "max_staff_users" integer NOT NULL DEFAULT '1', "has_custom_domain" boolean NOT NULL DEFAULT false, "has_theme_access" boolean NOT NULL DEFAULT false, "branding_removed" boolean NOT NULL DEFAULT false, "available_themes_count" integer NOT NULL DEFAULT '0', "available_color_palettes" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name"), CONSTRAINT "UQ_e7b71bb444e74ee067df057397e" UNIQUE ("slug"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_subscriptions" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "planId" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "current_period_start" TIMESTAMP NOT NULL, "current_period_end" TIMESTAMP NOT NULL, "cancel_at_period_end" boolean NOT NULL DEFAULT false, "cancelled_at" TIMESTAMP, "payment_method" character varying, "last_payment_date" TIMESTAMP, "next_billing_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_2dfab576863bc3f84d4f696227" UNIQUE ("userId"), CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "type" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "sender_id" character varying NOT NULL, "sender_name" character varying, "sentiment" character varying, "classification" character varying, "message_id" character varying, "comment_id" character varying, "post_id" character varying, "permalink_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, "facebookPagePageId" character varying, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "sku" character varying(64), "slug" character varying(255), "description" text, "main_image" character varying(512), "images" json, "price" integer NOT NULL, "stock" integer NOT NULL, "status" "public"."products_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_27f93dc477434cffcd926c2da0b" UNIQUE ("userId", "slug"), CONSTRAINT "UQ_7ded754ed71f89cd352a7c4de62" UNIQUE ("userId", "name"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text, "media_url" character varying, "is_published" boolean NOT NULL DEFAULT false, "scheduled_at" TIMESTAMP, "facebook_post_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "facebookPagePageId" character varying, "productId" integer NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facebook_pages" ("page_id" character varying NOT NULL, "name" character varying NOT NULL, "category" character varying, "access_token" character varying, "last_updated" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_ff57d4f5f300f2b7bf94f30df62" UNIQUE ("page_id", "userId"), CONSTRAINT "PK_d79dd6c6611a8b8aed0744d8520" PRIMARY KEY ("page_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facebook_page_subscription_subscribed_fields_enum" AS ENUM('feed', 'messages')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facebook_page_subscription" ("id" SERIAL NOT NULL, "page_id" character varying NOT NULL, "subscribed_fields" "public"."facebook_page_subscription_subscribed_fields_enum" array NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "PK_344879af3da4d4312df02db7d98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name_en" character varying NOT NULL, "name_ar" character varying NOT NULL, "suggested_sub_categories" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_da6f1e4e0c4683302df95d3ae9c" UNIQUE ("key"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "storefront_category" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "primaryCategoryId" integer NOT NULL, "secondaryCategoryId" integer, CONSTRAINT "REL_c4294b6c952355b18f02139dbf" UNIQUE ("storefrontId"), CONSTRAINT "PK_efe0859084013f37cbf340e0bda" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_categories" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "categoryId" integer NOT NULL, "name" character varying NOT NULL, "is_custom" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f319b046685c0e07287e76c5ab1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "storefronts" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "is_published" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "seo_title" character varying(255), "seo_description" text, "seo_image_url" character varying(512), "canonical_url" character varying(512), "noindex" boolean NOT NULL DEFAULT false, "facebook_pixel_id" character varying(64), "google_analytics_measurement_id" character varying(64), "theme_config" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d65bd7dc6e0712bccb6c71d8068" UNIQUE ("userId"), CONSTRAINT "UQ_620207bc6ebef1ef8d8c6cc9aa7" UNIQUE ("slug"), CONSTRAINT "REL_d65bd7dc6e0712bccb6c71d806" UNIQUE ("userId"), CONSTRAINT "PK_a08a38ba0d7f3569a181bc19bf8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying, "facebookId" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "fb_access_token" character varying, "reset_password_token" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productsId" integer, CONSTRAINT "UQ_f9740e1e654a5daddb82c60bd75" UNIQUE ("facebookId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_dfd7d90cc40088a3a75d7dfd283" UNIQUE ("userId", "token"), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_dashboard_enum" AS ENUM('basic', 'advanced')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_support_enum" AS ENUM('none', 'email', 'chat', 'VIP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price" integer NOT NULL, "product_limit" integer, "post_limit" integer, "comment_message_limit" integer, "dashboard" "public"."subscriptions_dashboard_enum" NOT NULL DEFAULT 'basic', "notifications" boolean NOT NULL DEFAULT false, "smart_classification" boolean NOT NULL DEFAULT false, "support" "public"."subscriptions_support_enum" NOT NULL DEFAULT 'none', "additional_admins" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "name" character varying(255), "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total_price" numeric(10,2) NOT NULL, "orderId" integer NOT NULL, "productId" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'shipped', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'paid')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_order_type_enum" AS ENUM('catalog', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "buyer_name" character varying(255) NOT NULL, "buyer_phone" character varying(32) NOT NULL, "buyer_email" character varying(255), "shipping_address_line1" character varying(255) NOT NULL, "shipping_address_line2" character varying(255), "shipping_city" character varying(128) NOT NULL, "shipping_state" character varying(128), "shipping_postal_code" character varying(32), "notes" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'unpaid', "order_type" "public"."orders_order_type_enum" NOT NULL DEFAULT 'catalog', "tracking_number" character varying(128), "internal_notes" text, "delivered_at" TIMESTAMP, "shipping_cost" numeric(10,2) NOT NULL DEFAULT '0', "total_amount" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "storefrontId" integer NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_order_requests_status_enum" AS ENUM('pending', 'quoted', 'accepted', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_order_requests" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "buyer_name" character varying(255) NOT NULL, "buyer_phone" character varying(32) NOT NULL, "description" text NOT NULL, "budget" numeric(10,2), "images" text, "status" "public"."custom_order_requests_status_enum" NOT NULL DEFAULT 'pending', "quoted_price" numeric(10,2), "quoted_shipping_cost" numeric(10,2), "seller_notes" text, "quoted_at" TIMESTAMP, "orderId" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_76d1c3f11fc931e327a6cc69823" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."addons_addon_type_enum" AS ENUM('message_pack', 'staff_seat', 'product_pack', 'posts_pack')`,
    );
    await queryRunner.query(
      `CREATE TABLE "addons" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "addon_type" "public"."addons_addon_type_enum" NOT NULL, "price" integer NOT NULL, "billing_cycle" character varying NOT NULL DEFAULT 'monthly', "provides_quantity" integer NOT NULL, "available_for_plans" json, "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_bf6897b3f7b2e6b712bdf01f297" UNIQUE ("name"), CONSTRAINT "UQ_359f971aa4b0ae502460f822caf" UNIQUE ("slug"), CONSTRAINT "PK_cd49fb3dc0558f02cb6fe6cc138" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_addons" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "addonId" integer NOT NULL, "quantity_purchased" integer NOT NULL DEFAULT '1', "status" character varying NOT NULL DEFAULT 'active', "expires_at" TIMESTAMP, "purchased_at" TIMESTAMP NOT NULL DEFAULT now(), "next_renewal_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a04a0d7a13fe3bc0c02a88d80e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usage_tracking" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "period_month" character varying(7) NOT NULL, "messages_received" integer NOT NULL DEFAULT '0', "posts_created" integer NOT NULL DEFAULT '0', "current_staff_count" integer NOT NULL DEFAULT '0', "last_reset_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2879a43395bb513204f88769aa6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_2dfab576863bc3f84d4f6962274" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_55c9f77733123bd2ead29886017" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd" FOREIGN KEY ("facebookPagePageId") REFERENCES "facebook_pages"("page_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_78eae136f1970a677a306e5871a" FOREIGN KEY ("facebookPagePageId") REFERENCES "facebook_pages"("page_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_59268dba986ee39a54affbdc00e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD CONSTRAINT "FK_f9811d917f02ed7ca5f86a617ff" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_page_subscription" ADD CONSTRAINT "FK_703fdadd942ac83fd92ebb5392f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_c4294b6c952355b18f02139dbf9" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_068b2b9491a4f85d9015e4b65fb" FOREIGN KEY ("primaryCategoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_34a6f2e5fea9ab86a62b228d8f4" FOREIGN KEY ("secondaryCategoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" ADD CONSTRAINT "FK_484c965a008e44d81a1ec4d925a" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" ADD CONSTRAINT "FK_dfa3adf1b46e582626b295d0257" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefronts" ADD CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9e9662808426cca2f97d6526c58" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_ff6014136574d2e1c1df0a6bf33" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_b20689c5876d8196f1e08af6a94" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_5d28cd60ee855c630b01ae398d0" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_addons" ADD CONSTRAINT "FK_8753ec0cb42ad1c65652d6c68f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_addons" ADD CONSTRAINT "FK_08064120d6669a93246645afbbb" FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_tracking" ADD CONSTRAINT "FK_5d8df20d681cd50fcde4db2db32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usage_tracking" DROP CONSTRAINT "FK_5d8df20d681cd50fcde4db2db32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_addons" DROP CONSTRAINT "FK_08064120d6669a93246645afbbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_addons" DROP CONSTRAINT "FK_8753ec0cb42ad1c65652d6c68f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_order_requests" DROP CONSTRAINT "FK_5d28cd60ee855c630b01ae398d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_order_requests" DROP CONSTRAINT "FK_b20689c5876d8196f1e08af6a94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_ff6014136574d2e1c1df0a6bf33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_55fa4db8406ed66bc7044328427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9e9662808426cca2f97d6526c58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefronts" DROP CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" DROP CONSTRAINT "FK_dfa3adf1b46e582626b295d0257"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_categories" DROP CONSTRAINT "FK_484c965a008e44d81a1ec4d925a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_34a6f2e5fea9ab86a62b228d8f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_068b2b9491a4f85d9015e4b65fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_c4294b6c952355b18f02139dbf9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_page_subscription" DROP CONSTRAINT "FK_703fdadd942ac83fd92ebb5392f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" DROP CONSTRAINT "FK_f9811d917f02ed7ca5f86a617ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_59268dba986ee39a54affbdc00e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_78eae136f1970a677a306e5871a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_99d90c2a483d79f3b627fb1d5e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_55c9f77733123bd2ead29886017"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_2dfab576863bc3f84d4f6962274"`,
    );
    await queryRunner.query(`DROP TABLE "usage_tracking"`);
    await queryRunner.query(`DROP TABLE "user_addons"`);
    await queryRunner.query(`DROP TABLE "addons"`);
    await queryRunner.query(`DROP TYPE "public"."addons_addon_type_enum"`);
    await queryRunner.query(`DROP TABLE "custom_order_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."custom_order_requests_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_order_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_support_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."subscriptions_dashboard_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "storefronts"`);
    await queryRunner.query(`DROP TABLE "sub_categories"`);
    await queryRunner.query(`DROP TABLE "storefront_category"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "facebook_page_subscription"`);
    await queryRunner.query(
      `DROP TYPE "public"."facebook_page_subscription_subscribed_fields_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facebook_pages"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE "plans"`);
  }
}
