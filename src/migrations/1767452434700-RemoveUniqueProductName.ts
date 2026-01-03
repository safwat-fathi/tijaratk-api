import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueProductName1767452434700 implements MigrationInterface {
    name = 'RemoveUniqueProductName1767452434700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_7ded754ed71f89cd352a7c4de62"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_7ded754ed71f89cd352a7c4de62" UNIQUE ("name", "userId")`);
    }

}
