import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertStoreLocationToGeography1767883055472
  implements MigrationInterface
{
  name = 'ConvertStoreLocationToGeography1767883055472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Enable PostGIS extension (if not already enabled)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    // Step 2: Add new location column with geography type
    await queryRunner.query(`
      ALTER TABLE "stores" 
      ADD COLUMN "location" geography(Point, 4326)
    `);

    // Step 3: Migrate existing data from latitude/longitude to location
    // Only update rows where both latitude and longitude exist
    await queryRunner.query(`
      UPDATE "stores" 
      SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
      WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL
    `);

    // Step 4: Drop old latitude and longitude columns
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "longitude"`);

    // Step 5: Create spatial index on location column
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_stores_location" 
      ON "stores" 
      USING GIST ("location")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop spatial index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stores_location"`);

    // Step 2: Add back latitude and longitude columns
    await queryRunner.query(`
      ALTER TABLE "stores" 
      ADD COLUMN "latitude" numeric(10,7)
    `);
    await queryRunner.query(`
      ALTER TABLE "stores" 
      ADD COLUMN "longitude" numeric(10,7)
    `);

    // Step 3: Migrate data back from location to latitude/longitude
    await queryRunner.query(`
      UPDATE "stores" 
      SET 
        "latitude" = ST_Y("location"::geometry),
        "longitude" = ST_X("location"::geometry)
      WHERE "location" IS NOT NULL
    `);

    // Step 4: Drop location column
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "location"`);
  }
}
