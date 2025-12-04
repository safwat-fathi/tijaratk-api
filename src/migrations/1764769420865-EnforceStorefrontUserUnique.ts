import { MigrationInterface, QueryRunner } from "typeorm";

export class EnforceStorefrontUserUnique1764769420865 implements MigrationInterface {
    name = 'EnforceStorefrontUserUnique1764769420865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "storefronts" DROP CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068"`);
        await queryRunner.query(`ALTER TABLE "storefronts" ADD CONSTRAINT "UQ_d65bd7dc6e0712bccb6c71d8068" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "storefronts" ADD CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "storefronts" DROP CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068"`);
        await queryRunner.query(`ALTER TABLE "storefronts" DROP CONSTRAINT "UQ_d65bd7dc6e0712bccb6c71d8068"`);
        await queryRunner.query(`ALTER TABLE "storefronts" ADD CONSTRAINT "FK_d65bd7dc6e0712bccb6c71d8068" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
