import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotifications1767518620767 implements MigrationInterface {
  name = 'UpdateNotifications1767518620767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "productName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "productName"`,
    );
  }
}
