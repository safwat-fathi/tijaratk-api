import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationForSentimentAndClassification1744003528730 implements MigrationInterface {
  name = 'UpdateNotificationForSentimentAndClassification1744003528730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "sentiment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "classification" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "classification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "sentiment"`,
    );
  }
}
