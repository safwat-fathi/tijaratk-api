import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPushSubscriptions1767538034851 implements MigrationInterface {
    name = 'AddPushSubscriptions1767538034851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_subscriptions" ("id" SERIAL NOT NULL, "endpoint" text NOT NULL, "p256dh" text NOT NULL, "auth" text NOT NULL, "user_agent" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_0008bdfd174e533a3f98bf9af16" UNIQUE ("endpoint"), CONSTRAINT "PK_757fc8f00c34f66832668dc2e53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "push_subscriptions" ADD CONSTRAINT "FK_4cc061875e9eecc311a94b3e431" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_subscriptions" DROP CONSTRAINT "FK_4cc061875e9eecc311a94b3e431"`);
        await queryRunner.query(`DROP TABLE "push_subscriptions"`);
    }

}
