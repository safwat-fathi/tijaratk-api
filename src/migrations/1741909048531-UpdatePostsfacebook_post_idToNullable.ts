import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostsfacebookPostIdToNullable1741909048531 implements MigrationInterface {
  name = 'UpdatePostsfacebookPostIdToNullable1741909048531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "facebook_post_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "facebook_post_id" SET NOT NULL`,
    );
  }
}
