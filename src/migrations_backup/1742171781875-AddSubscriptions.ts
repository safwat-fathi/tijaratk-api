import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptions1742171781875 implements MigrationInterface {
  name = 'AddSubscriptions1742171781875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_dashboard_enum" AS ENUM('basic', 'advanced')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_support_enum" AS ENUM('none', 'email', 'chat', 'VIP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price" integer NOT NULL, "product_limit" integer, "post_limit" integer, "comment_message_limit" integer, "dashboard" "public"."subscriptions_dashboard_enum" NOT NULL DEFAULT 'basic', "notifications" boolean NOT NULL DEFAULT false, "smart_classification" boolean NOT NULL DEFAULT false, "support" "public"."subscriptions_support_enum" NOT NULL DEFAULT 'none', "additional_admins" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionId" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_07f4c2455fc50d34b0b39d67a01" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_07f4c2455fc50d34b0b39d67a01"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionId"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_support_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."subscriptions_dashboard_enum"`,
    );
  }
}
