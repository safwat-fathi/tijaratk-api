import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostsIsPublished1742080284670 implements MigrationInterface {
  name = 'UpdatePostsIsPublished1742080284670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "published" TO "is_published"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "is_published" TO "published"`,
    );
  }
}
