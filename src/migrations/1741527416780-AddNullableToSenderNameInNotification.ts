import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNullableToSenderNameInNotification1741527416780
  implements MigrationInterface
{
  name = 'AddNullableToSenderNameInNotification1741527416780';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "sender_name" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "sender_name" SET NOT NULL`,
    );
  }
}
