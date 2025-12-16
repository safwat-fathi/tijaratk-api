import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlansAndBilingSystem1765887150903 implements MigrationInterface {
    name = 'AddPlansAndBilingSystem1765887150903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plans" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "price" integer NOT NULL, "billing_cycle" character varying NOT NULL DEFAULT 'monthly', "max_products" integer, "max_posts_per_month" integer, "max_messages_per_month" integer, "max_staff_users" integer NOT NULL DEFAULT '1', "has_custom_domain" boolean NOT NULL DEFAULT false, "has_theme_access" boolean NOT NULL DEFAULT false, "branding_removed" boolean NOT NULL DEFAULT false, "available_themes_count" integer NOT NULL DEFAULT '0', "available_color_palettes" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name"), CONSTRAINT "UQ_e7b71bb444e74ee067df057397e" UNIQUE ("slug"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_subscriptions" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "planId" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "current_period_start" TIMESTAMP NOT NULL, "current_period_end" TIMESTAMP NOT NULL, "cancel_at_period_end" boolean NOT NULL DEFAULT false, "cancelled_at" TIMESTAMP, "payment_method" character varying, "last_payment_date" TIMESTAMP, "next_billing_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_2dfab576863bc3f84d4f696227" UNIQUE ("userId"), CONSTRAINT "PK_9e928b0954e51705ab44988812c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."addons_addon_type_enum" AS ENUM('message_pack', 'staff_seat', 'product_pack', 'posts_pack')`);
        await queryRunner.query(`CREATE TABLE "addons" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "addon_type" "public"."addons_addon_type_enum" NOT NULL, "price" integer NOT NULL, "billing_cycle" character varying NOT NULL DEFAULT 'monthly', "provides_quantity" integer NOT NULL, "available_for_plans" json, "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_bf6897b3f7b2e6b712bdf01f297" UNIQUE ("name"), CONSTRAINT "UQ_359f971aa4b0ae502460f822caf" UNIQUE ("slug"), CONSTRAINT "PK_cd49fb3dc0558f02cb6fe6cc138" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_addons" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "addonId" integer NOT NULL, "quantity_purchased" integer NOT NULL DEFAULT '1', "status" character varying NOT NULL DEFAULT 'active', "expires_at" TIMESTAMP, "purchased_at" TIMESTAMP NOT NULL DEFAULT now(), "next_renewal_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a04a0d7a13fe3bc0c02a88d80e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usage_tracking" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "period_month" character varying(7) NOT NULL, "messages_received" integer NOT NULL DEFAULT '0', "posts_created" integer NOT NULL DEFAULT '0', "current_staff_count" integer NOT NULL DEFAULT '0', "last_reset_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2879a43395bb513204f88769aa6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_2dfab576863bc3f84d4f6962274" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_55c9f77733123bd2ead29886017" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_addons" ADD CONSTRAINT "FK_8753ec0cb42ad1c65652d6c68f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_addons" ADD CONSTRAINT "FK_08064120d6669a93246645afbbb" FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usage_tracking" ADD CONSTRAINT "FK_5d8df20d681cd50fcde4db2db32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage_tracking" DROP CONSTRAINT "FK_5d8df20d681cd50fcde4db2db32"`);
        await queryRunner.query(`ALTER TABLE "user_addons" DROP CONSTRAINT "FK_08064120d6669a93246645afbbb"`);
        await queryRunner.query(`ALTER TABLE "user_addons" DROP CONSTRAINT "FK_8753ec0cb42ad1c65652d6c68f4"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_55c9f77733123bd2ead29886017"`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_2dfab576863bc3f84d4f6962274"`);
        await queryRunner.query(`DROP TABLE "usage_tracking"`);
        await queryRunner.query(`DROP TABLE "user_addons"`);
        await queryRunner.query(`DROP TABLE "addons"`);
        await queryRunner.query(`DROP TYPE "public"."addons_addon_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_subscriptions"`);
        await queryRunner.query(`DROP TABLE "plans"`);
    }

}
