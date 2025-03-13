import { Logger } from '@nestjs/common';
import dataSource from 'src/config/orm.config';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Seeding...');

  await dataSource.initialize();

  // const permissionRepository = dataSource.getRepository(Permission);

  try {
    // await permissionRepository.save(permissions);
    logger.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
