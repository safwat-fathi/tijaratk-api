import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPosts1741906754141 implements MigrationInterface {
  name = 'AddPosts1741906754141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "content" text, "media_url" character varying, "published" boolean NOT NULL DEFAULT false, "scheduled_at" TIMESTAMP, "facebook_post_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "productId" integer NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_59268dba986ee39a54affbdc00e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_59268dba986ee39a54affbdc00e"`,
    );
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
