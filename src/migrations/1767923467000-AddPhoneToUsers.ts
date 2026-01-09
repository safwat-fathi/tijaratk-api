import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneToUsers1767923467000 implements MigrationInterface {
    name = 'AddPhoneToUsers1767923467000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add phone column as nullable first (skip if exists)
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" character varying`);

        // 2. Update existing records to have a unique phone number (using random prefix + id to avoid collision)
        // This ensures the unique constraint won't fail if there's existing data
        await queryRunner.query(`UPDATE "users" SET "phone" = 'UNKNOWN_' || "id" WHERE "phone" IS NULL`);

        // 3. Set NOT NULL constraint (only if column is nullable)
        const columnInfo = await queryRunner.query(`SELECT is_nullable FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone'`);
        if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'YES') {
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`);
        }

        // 4. Add Unique Constraint if not exists
        const hasConstraint = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_phone'`);
        if (hasConstraint.length === 0) {
            await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_phone" UNIQUE ("phone")`);
        }

        // 5. Add Index if not exists
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_phone" ON "users" ("phone")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_users_phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }
}
