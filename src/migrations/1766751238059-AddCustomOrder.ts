import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomOrder1766751238059 implements MigrationInterface {
    name = 'AddCustomOrder1766751238059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`CREATE TYPE "public"."custom_order_requests_status_enum" AS ENUM('pending', 'quoted', 'accepted', 'rejected', 'expired')`);
        await queryRunner.query(`CREATE TABLE "custom_order_requests" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "buyer_name" character varying(255) NOT NULL, "buyer_phone" character varying(32) NOT NULL, "description" text NOT NULL, "budget" numeric(10,2), "images" text, "status" "public"."custom_order_requests_status_enum" NOT NULL DEFAULT 'pending', "quoted_price" numeric(10,2), "quoted_shipping_cost" numeric(10,2), "seller_notes" text, "quoted_at" TIMESTAMP, "orderId" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_76d1c3f11fc931e327a6cc69823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "name" character varying(255)`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'paid')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'unpaid'`);
        await queryRunner.query(`CREATE TYPE "public"."orders_order_type_enum" AS ENUM('catalog', 'custom')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "order_type" "public"."orders_order_type_enum" NOT NULL DEFAULT 'catalog'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "tracking_number" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "internal_notes" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "delivered_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipping_cost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "productId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_b20689c5876d8196f1e08af6a94" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_5d28cd60ee855c630b01ae398d0" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT "FK_5d28cd60ee855c630b01ae398d0"`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT "FK_b20689c5876d8196f1e08af6a94"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "productId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivered_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "internal_notes"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tracking_number"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_type"`);
        await queryRunner.query(`DROP TYPE "public"."orders_order_type_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TABLE "custom_order_requests"`);
        await queryRunner.query(`DROP TYPE "public"."custom_order_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
