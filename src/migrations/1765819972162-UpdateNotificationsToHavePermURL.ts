import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationsToHavePermURL1765819972162 implements MigrationInterface {
  name = 'UpdateNotificationsToHavePermURL1765819972162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "message_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "comment_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "post_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "permalink_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "permalink_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "post_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "message_id"`,
    );
  }
}
