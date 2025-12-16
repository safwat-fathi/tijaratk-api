import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSubscriptionFromUsersTable1765894566076 implements MigrationInterface {
    name = 'RemoveSubscriptionFromUsersTable1765894566076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_07f4c2455fc50d34b0b39d67a01"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_07f4c2455fc50d34b0b39d67a01" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
