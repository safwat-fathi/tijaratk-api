import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductVariantDefaultConstraint1768553333307 implements MigrationInterface {
    name = 'ProductVariantDefaultConstraint1768553333307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd"`);
        await queryRunner.query(`ALTER TABLE "store_visits" DROP CONSTRAINT "FK_store_visits_store"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_133ec679a801fab5e070f73d3e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bfee32716cdb80a065fb83389"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_store_visits_store_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_store_visits_created_at"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "sentiment"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "classification"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "message_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "comment_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "post_id"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "permalink_url"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "facebookPagePageId"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_cbb50ac77af86114525e1282d13"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "whatsapp_number"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "stock" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "sale_price" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "cost_price" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "wholesale_price" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "store_visits" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_cbb50ac77af86114525e1282d13" PRIMARY KEY ("user_id", "id")`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "name" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "whatsapp_number" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE TYPE "public"."product_variants_unit_enum" AS ENUM('kg', 'g', 'liter', 'piece', 'pack')`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "unit" "public"."product_variants_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "sender_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_31e615e1e93111f90aa7b5ed06" ON "product_variants" ("product_id") WHERE is_default = true`);
        await queryRunner.query(`CREATE INDEX "IDX_886da8138ba4f90d84004f44d7" ON "store_visits" ("store_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ca6bad4326636e97459a3a87a" ON "store_visits" ("created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_133ec679a801fab5e070f73d3e" ON "customers" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7bfee32716cdb80a065fb83389" ON "customers" ("whatsapp_number") `);
        await queryRunner.query(`ALTER TABLE "store_visits" ADD CONSTRAINT "FK_886da8138ba4f90d84004f44d7c" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1032595a041e164936f69385b46" FOREIGN KEY ("customer_id", "customer_id") REFERENCES "customers"("user_id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_b708a7bad7d2f41839223e282ee" FOREIGN KEY ("customer_id", "customer_id") REFERENCES "customers"("user_id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT "FK_b708a7bad7d2f41839223e282ee"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1032595a041e164936f69385b46"`);
        await queryRunner.query(`ALTER TABLE "store_visits" DROP CONSTRAINT "FK_886da8138ba4f90d84004f44d7c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bfee32716cdb80a065fb83389"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_133ec679a801fab5e070f73d3e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ca6bad4326636e97459a3a87a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_886da8138ba4f90d84004f44d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31e615e1e93111f90aa7b5ed06"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "sender_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "unit"`);
        await queryRunner.query(`DROP TYPE "public"."product_variants_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "unit" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "whatsapp_number"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_cbb50ac77af86114525e1282d13"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "store_visits" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "wholesale_price"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "sale_price"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "whatsapp_number" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "name" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_cbb50ac77af86114525e1282d13" PRIMARY KEY ("user_id", "id")`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "facebookPagePageId" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "permalink_url" text`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "post_id" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "comment_id" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "message_id" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "classification" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "sentiment" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_store_visits_created_at" ON "store_visits" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_store_visits_store_id" ON "store_visits" ("store_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7bfee32716cdb80a065fb83389" ON "customers" ("whatsapp_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_133ec679a801fab5e070f73d3e" ON "customers" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_phone" ON "users" ("phone") `);
        await queryRunner.query(`ALTER TABLE "store_visits" ADD CONSTRAINT "FK_store_visits_store" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd" FOREIGN KEY ("facebookPagePageId") REFERENCES "facebook_pages"("page_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
