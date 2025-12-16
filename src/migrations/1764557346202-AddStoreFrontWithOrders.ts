import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreFrontWithOrders1764557346202 implements MigrationInterface {
  name = 'AddStoreFrontWithOrders1764557346202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "storefronts" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "is_published" boolean NOT NULL DEFAULT false, "seo_title" character varying(255), "seo_description" text, "seo_image_url" character varying(512), "canonical_url" character varying(512), "noindex" boolean NOT NULL DEFAULT false, "facebook_pixel_id" character varying(64), "google_analytics_measurement_id" character varying(64), "theme_config" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "UQ_620207bc6ebef1ef8d8c6cc9aa7" UNIQUE ("slug"), CONSTRAINT "PK_a08a38ba0d7f3569a181bc19bf8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total_price" numeric(10,2) NOT NULL, "orderId" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'shipped', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "buyer_name" character varying(255) NOT NULL, "buyer_phone" character varying(32) NOT NULL, "buyer_email" character varying(255), "shipping_address_line1" character varying(255) NOT NULL, "shipping_address_line2" character varying(255), "shipping_city" character varying(128) NOT NULL, "shipping_state" character varying(128), "shipping_postal_code" character varying(32), "notes" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "total_amount" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "storefrontId" integer NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "sku" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "slug" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_27f93dc477434cffcd926c2da0b" UNIQUE ("userId", "slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "storefronts" ADD CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_ff6014136574d2e1c1df0a6bf33" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "storefronts" DROP CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_27f93dc477434cffcd926c2da0b"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sku"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "storefronts"`);
  }
}
