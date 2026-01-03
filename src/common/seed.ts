import { Logger } from '@nestjs/common';
import { seedPlans, seedUserSubscription } from 'src/billing/plans.seed';
import { seedCategories } from 'src/categories/categories.seed';
import dataSource from 'src/config/orm.config';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Seeding...');

  await dataSource.initialize();

  try {
    // Seed generic plans and addons
    await seedPlans(dataSource);
    // Seed categories
    await seedCategories(dataSource);

    logger.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
