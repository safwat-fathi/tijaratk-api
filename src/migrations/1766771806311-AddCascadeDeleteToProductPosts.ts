import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteToProductPosts1766771806311 implements MigrationInterface {
    name = 'AddCascadeDeleteToProductPosts1766771806311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_59268dba986ee39a54affbdc00e"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_59268dba986ee39a54affbdc00e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_59268dba986ee39a54affbdc00e"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_59268dba986ee39a54affbdc00e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
