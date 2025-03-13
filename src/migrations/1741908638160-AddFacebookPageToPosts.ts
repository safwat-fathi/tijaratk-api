import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacebookPageToPosts1741908638160 implements MigrationInterface {
  name = 'AddFacebookPageToPosts1741908638160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "facebookPagePageId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_78eae136f1970a677a306e5871a" FOREIGN KEY ("facebookPagePageId") REFERENCES "facebook_pages"("page_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_78eae136f1970a677a306e5871a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN "facebookPagePageId"`,
    );
  }
}
