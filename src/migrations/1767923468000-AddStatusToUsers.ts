import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToUsers1767923468000 implements MigrationInterface {
    name = 'AddStatusToUsers1767923468000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create enum type
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'blocked', 'pending')`);

        // 2. Add status column with default value
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);

        // 2. Drop enum type
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }
}
