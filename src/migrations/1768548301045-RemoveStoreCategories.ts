import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStoreCategories1768548301045 implements MigrationInterface {
    name = 'RemoveStoreCategories1768548301045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT IF EXISTS "FK_40abd374d12d7b19c471aa156cd"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_133ec679a801fab5e070f73d3e"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_7bfee32716cdb80a065fb83389"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN IF EXISTS "is_open"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "PK_cbb50ac77af86114525e1282d13"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT IF EXISTS "FK_435af75bd28ed784b3c02bbed54"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "whatsapp_number"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "icon" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "sort_order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_cbb50ac77af86114525e1282d13" PRIMARY KEY ("user_id", "id")`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "name" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "whatsapp_number" character varying(20) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_133ec679a801fab5e070f73d3e" ON "customers" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7bfee32716cdb80a065fb83389" ON "customers" ("whatsapp_number") `);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_40abd374d12d7b19c471aa156cd" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_40abd374d12d7b19c471aa156cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bfee32716cdb80a065fb83389"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_133ec679a801fab5e070f73d3e"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "whatsapp_number"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_cbb50ac77af86114525e1282d13"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "sort_order"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "whatsapp_number" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "name" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "PK_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_cbb50ac77af86114525e1282d13" PRIMARY KEY ("user_id", "id")`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "is_open" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE INDEX "IDX_7bfee32716cdb80a065fb83389" ON "customers" ("whatsapp_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_133ec679a801fab5e070f73d3e" ON "customers" ("id") `);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_40abd374d12d7b19c471aa156cd" FOREIGN KEY ("category_id") REFERENCES "store_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
