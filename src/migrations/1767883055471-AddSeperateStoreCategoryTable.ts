import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeperateStoreCategoryTable1767883055471 implements MigrationInterface {
    name = 'AddSeperateStoreCategoryTable1767883055471'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`CREATE TABLE "store_seo" ("id" SERIAL NOT NULL, "store_id" integer NOT NULL, "title" text, "description" text, "is_indexable" boolean NOT NULL DEFAULT true, "canonical_url" text, "og" jsonb, "twitter" jsonb, "schema_org" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_2112d143bc3c06c18428427a270" UNIQUE ("store_id"), CONSTRAINT "REL_2112d143bc3c06c18428427a27" UNIQUE ("store_id"), CONSTRAINT "PK_cc930f9003e68f49a3d1c15d0a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "store_categories" ("id" SERIAL NOT NULL, "key" character varying(100) NOT NULL, "name_en" character varying(100) NOT NULL, "name_ar" character varying(100) NOT NULL, "description_en" text, "description_ar" text, "icon" character varying(50), "parent_id" integer, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_9701425a82bff7ecceaf93270a2" UNIQUE ("key"), CONSTRAINT "PK_cb45b580415ab1c443b5561710a" PRIMARY KEY ("id"))`);
        
        // Update Stores table
        // Note: Location and Type are handled in subsequent migrations (safely migrating data)
        await queryRunner.query(`ALTER TABLE "stores" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "category_id" integer`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "deleted_at" TIMESTAMP`);
        
        // Add Indexes
        // Location index added in ConvertStoreLocationToGeography

        
        // Add New Constraints
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_40abd374d12d7b19c471aa156cd" FOREIGN KEY ("category_id") REFERENCES "store_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        
        // Missing FK in products from pivot_schema_init
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_68863607048a1abd43772b314ef" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        
        // Constraints for new tables
        await queryRunner.query(`ALTER TABLE "store_seo" ADD CONSTRAINT "FK_2112d143bc3c06c18428427a270" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_categories" ADD CONSTRAINT "FK_2cf12cb5820980f6fba04791ea6" FOREIGN KEY ("parent_id") REFERENCES "store_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_events" ADD CONSTRAINT "FK_f7ddfa78eb2478787f7cc5c3552" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "product_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_events" ADD CONSTRAINT "FK_fc45514a25429fcd5d8664f9b4e" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_11836543386b9135a47d54cab70" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "merchant_id"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "merchant_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_b7a7bb813431fc7cd73cced0001" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_68863607048a1abd43772b314ef" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "merchants" DROP CONSTRAINT "PK_4fd312ef25f8e05ad47bfe7ed25"`);
        await queryRunner.query(`ALTER TABLE "merchants" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "merchants" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "merchants" ADD CONSTRAINT "PK_4fd312ef25f8e05ad47bfe7ed25" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_882687fd3a8a29fa5bf13858a5b" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."stores_type_enum"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "longitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "latitude" numeric(10,7)`);
        await queryRunner.query(`DROP TABLE "store_categories"`);
        await queryRunner.query(`DROP TABLE "store_seo"`);

    }

}
