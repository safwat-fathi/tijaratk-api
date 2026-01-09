import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreThemesTable1767883055474 implements MigrationInterface {
  name = 'CreateStoreThemesTable1767883055474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Create the store_themes table with JSONB config
    await queryRunner.query(`
      CREATE TABLE "store_themes" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL UNIQUE,
        "config" JSONB NOT NULL DEFAULT '{}',
        "version" INT NOT NULL DEFAULT 1,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_store_themes_store_id" 
          FOREIGN KEY ("store_id") 
          REFERENCES "stores"("id") 
          ON DELETE CASCADE
      )
    `);

    // Step 2: Create index on store_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_store_themes_store_id" ON "store_themes" ("store_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the store_themes table
    await queryRunner.query(`DROP TABLE "store_themes"`);
  }
}
