import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCustomerUserIdNullable1768631612380 implements MigrationInterface {
    name = 'MakeCustomerUserIdNullable1768631612380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop all foreign key constraints referencing the customers table
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_1032595a041e164936f69385b46"`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT IF EXISTS "FK_b708a7bad7d2f41839223e282ee"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "FK_11d81cd7be87b6f8865b0cf7661"`);
        
        // 2. Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_133ec679a801fab5e070f73d3e"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_7bfee32716cdb80a065fb83389"`);
        
        // 3. Drop the composite primary key constraint
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "PK_cbb50ac77af86114525e1282d13"`);
        
        // 4. Make id the sole primary key
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")`);
        
        // 5. Now we can make user_id nullable
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "user_id" DROP NOT NULL`);
        
        // 6. Create index on user_id
        await queryRunner.query(`CREATE INDEX "IDX_customers_user_id" ON "customers" ("user_id")`);
        
        // 7. Create index on whatsapp_number
        await queryRunner.query(`CREATE INDEX "IDX_customers_whatsapp" ON "customers" ("whatsapp_number")`);
        
        // 8. Re-add foreign key from customers.user_id to users.id with SET NULL on delete
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_customers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        
        // 9. Re-add foreign key from orders.customer_id to customers.id
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // 10. Re-add foreign key from custom_order_requests.customer_id to customers.id
        await queryRunner.query(`ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_custom_orders_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop new foreign keys
        await queryRunner.query(`ALTER TABLE "custom_order_requests" DROP CONSTRAINT IF EXISTS "FK_custom_orders_customer"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_customer"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "FK_customers_user"`);
        
        // Drop new indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_customers_whatsapp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_customers_user_id"`);
        
        // Drop simple primary key
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "PK_customers_id"`);
        
        // Make user_id NOT NULL again (will fail if there are null values!)
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "user_id" SET NOT NULL`);
        
        // Restore composite primary key
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "PK_cbb50ac77af86114525e1282d13" PRIMARY KEY ("user_id", "id")`);
        
        // Restore indexes
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_133ec679a801fab5e070f73d3e" ON "customers" ("id")`);
        await queryRunner.query(`CREATE INDEX "IDX_7bfee32716cdb80a065fb83389" ON "customers" ("whatsapp_number")`);
        
        // Restore original foreign keys
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_11d81cd7be87b6f8865b0cf7661" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1032595a041e164936f69385b46" FOREIGN KEY ("customer_id", "customer_id") REFERENCES "customers"("user_id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_order_requests" ADD CONSTRAINT "FK_b708a7bad7d2f41839223e282ee" FOREIGN KEY ("customer_id", "customer_id") REFERENCES "customers"("user_id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
