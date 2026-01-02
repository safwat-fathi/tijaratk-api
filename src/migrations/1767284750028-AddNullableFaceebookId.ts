import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNullableFaceebookId1767284750028 implements MigrationInterface {
    name = 'AddNullableFaceebookId1767284750028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "facebookId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "facebookId" SET NOT NULL`);
    }

}
