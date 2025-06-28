import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFcmTokenToUsers1751105211041 implements MigrationInterface {
  name = 'AddFcmTokenToUsers1703123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'fcmToken',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'fcmToken');
  }
}
