import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationFacebookPageToNotification1741527326392 implements MigrationInterface {
  name = 'AddRelationFacebookPageToNotification1741527326392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "sender_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "sender_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "facebookPagePageId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd" FOREIGN KEY ("facebookPagePageId") REFERENCES "facebook_pages"("page_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_d868a6e144cad4d92a24ce168fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "facebookPagePageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "sender_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "sender_id"`,
    );
  }
}
