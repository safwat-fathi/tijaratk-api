import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFacebookPagesPrimaryKey1741408150257 implements MigrationInterface {
  name = 'UpdateFacebookPagesPrimaryKey1741408150257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" DROP CONSTRAINT "PK_496674684a6f17fd3aee100be28"`,
    );
    await queryRunner.query(`ALTER TABLE "facebook_pages" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" DROP CONSTRAINT "UQ_ff57d4f5f300f2b7bf94f30df62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ALTER COLUMN "page_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD CONSTRAINT "PK_d79dd6c6611a8b8aed0744d8520" PRIMARY KEY ("page_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD CONSTRAINT "UQ_ff57d4f5f300f2b7bf94f30df62" UNIQUE ("page_id", "userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" DROP CONSTRAINT "UQ_ff57d4f5f300f2b7bf94f30df62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" DROP CONSTRAINT "PK_d79dd6c6611a8b8aed0744d8520"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ALTER COLUMN "page_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD CONSTRAINT "UQ_ff57d4f5f300f2b7bf94f30df62" UNIQUE ("page_id", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "facebook_pages" ADD CONSTRAINT "PK_496674684a6f17fd3aee100be28" PRIMARY KEY ("id")`,
    );
  }
}
