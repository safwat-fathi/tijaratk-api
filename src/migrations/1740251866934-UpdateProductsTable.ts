import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductsTable1740251866934 implements MigrationInterface {
  name = 'UpdateProductsTable1740251866934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "quantity"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stock" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "status" "public"."products_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "tags" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "quantity" integer`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "description" character varying`,
    );
  }
}
