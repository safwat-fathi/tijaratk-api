import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreTypeEnum1767883055473 implements MigrationInterface {
  name = 'AddStoreTypeEnum1767883055473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create the store_type enum
    await queryRunner.query(`
      CREATE TYPE "stores_type_enum" AS ENUM ('physical', 'online', 'hybrid')
    `);

    // Step 2: Add type column with default 'online'
    await queryRunner.query(`
      ALTER TABLE "stores" 
      ADD COLUMN "type" "stores_type_enum" NOT NULL DEFAULT 'online'
    `);

    // Step 3: Update existing stores based on location presence
    // - Stores WITH location → 'physical'
    // - Stores WITHOUT location → 'online'
    await queryRunner.query(`
      UPDATE "stores" 
      SET "type" = 'physical'
      WHERE "location" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the type column
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "type"`);

    // Step 2: Drop the enum type
    await queryRunner.query(`DROP TYPE "stores_type_enum"`);
  }
}
