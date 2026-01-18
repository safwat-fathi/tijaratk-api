import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStoreVisit1768729551400 implements MigrationInterface {
  name = 'UpdateStoreVisit1768729551400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."store_visits_source_enum" AS ENUM('direct', 'whatsapp', 'instagram', 'facebook', 'google', 'tiktok', 'twitter', 'other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "store_visits" ADD "source" "public"."store_visits_source_enum" NOT NULL DEFAULT 'direct'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "store_visits" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."store_visits_source_enum"`);
  }
}
