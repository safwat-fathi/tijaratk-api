import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdentityTable1767364341158 implements MigrationInterface {
    name = 'AddUserIdentityTable1767364341158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_identities_provider_enum" AS ENUM('facebook')`);
        await queryRunner.query(`CREATE TABLE "user_identities" ("id" SERIAL NOT NULL, "provider" "public"."user_identities_provider_enum" NOT NULL, "providerId" character varying NOT NULL, "accessToken" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_a810154198446b51fdf3f227c5f" UNIQUE ("provider", "providerId"), CONSTRAINT "PK_e23bff04e9c3e7b785e442b262c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_f9740e1e654a5daddb82c60bd75"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebookId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fb_access_token"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_identities" ADD CONSTRAINT "FK_084cef3785217102f222e90ea7c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_identities" DROP CONSTRAINT "FK_084cef3785217102f222e90ea7c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "fb_access_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "facebookId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_f9740e1e654a5daddb82c60bd75" UNIQUE ("facebookId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP TABLE "user_identities"`);
        await queryRunner.query(`DROP TYPE "public"."user_identities_provider_enum"`);
    }

}
