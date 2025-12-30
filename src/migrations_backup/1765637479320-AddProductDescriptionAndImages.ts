import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDescriptionAndImages1765637479320 implements MigrationInterface {
  name = 'AddProductDescriptionAndImages1765637479320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "main_image" character varying(512)`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "images" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "main_image"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "description"`);
  }
}
