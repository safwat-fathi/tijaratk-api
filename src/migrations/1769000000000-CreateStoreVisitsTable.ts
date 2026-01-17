import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreVisitsTable1769000000000 implements MigrationInterface {
  name = 'CreateStoreVisitsTable1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "store_visits" (
        "id" SERIAL NOT NULL,
        "store_id" integer NOT NULL,
        "visitor_ip_hash" character varying(64),
        "user_agent" text,
        "referer" character varying(512),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store_visits" PRIMARY KEY ("id"),
        CONSTRAINT "FK_store_visits_store" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_store_visits_store_id" ON "store_visits" ("store_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_store_visits_created_at" ON "store_visits" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_store_visits_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_store_visits_store_id"`);
    await queryRunner.query(`DROP TABLE "store_visits"`);
  }
}
