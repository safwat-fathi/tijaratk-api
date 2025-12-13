import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStorefrontCategories1765529779141 implements MigrationInterface {
    name = 'AddStorefrontCategories1765529779141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name_en" character varying NOT NULL, "name_ar" character varying NOT NULL, "suggested_sub_categories" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_da6f1e4e0c4683302df95d3ae9c" UNIQUE ("key"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sub_categories" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "categoryId" integer NOT NULL, "name" character varying NOT NULL, "is_custom" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f319b046685c0e07287e76c5ab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "storefront_category" ("id" SERIAL NOT NULL, "storefrontId" integer NOT NULL, "primaryCategoryId" integer NOT NULL, "secondaryCategoryId" integer, CONSTRAINT "REL_c4294b6c952355b18f02139dbf" UNIQUE ("storefrontId"), CONSTRAINT "PK_efe0859084013f37cbf340e0bda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sub_categories" ADD CONSTRAINT "FK_484c965a008e44d81a1ec4d925a" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_categories" ADD CONSTRAINT "FK_dfa3adf1b46e582626b295d0257" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_c4294b6c952355b18f02139dbf9" FOREIGN KEY ("storefrontId") REFERENCES "storefronts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_068b2b9491a4f85d9015e4b65fb" FOREIGN KEY ("primaryCategoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "storefront_category" ADD CONSTRAINT "FK_34a6f2e5fea9ab86a62b228d8f4" FOREIGN KEY ("secondaryCategoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_34a6f2e5fea9ab86a62b228d8f4"`);
        await queryRunner.query(`ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_068b2b9491a4f85d9015e4b65fb"`);
        await queryRunner.query(`ALTER TABLE "storefront_category" DROP CONSTRAINT "FK_c4294b6c952355b18f02139dbf9"`);
        await queryRunner.query(`ALTER TABLE "sub_categories" DROP CONSTRAINT "FK_dfa3adf1b46e582626b295d0257"`);
        await queryRunner.query(`ALTER TABLE "sub_categories" DROP CONSTRAINT "FK_484c965a008e44d81a1ec4d925a"`);
        await queryRunner.query(`DROP TABLE "storefront_category"`);
        await queryRunner.query(`DROP TABLE "sub_categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
