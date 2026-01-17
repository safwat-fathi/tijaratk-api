import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductVariantStockToInteger1768568926404 implements MigrationInterface {
    name = 'ProductVariantStockToInteger1768568926404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" ALTER COLUMN "stock" TYPE integer USING "stock"::integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" ALTER COLUMN "stock" TYPE numeric`);
    }

}
