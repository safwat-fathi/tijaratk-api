import { Logger } from '@nestjs/common';
import dataSource from 'src/config/orm.config';
import { seedProducts } from 'src/products/products.seed';
import { seedCategories } from 'src/categories/categories.seed';
import { seedPlans, seedUserSubscription } from 'src/billing/plans.seed';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Seeding...');

  await dataSource.initialize();

  try {
    // Seed generic plans and addons
    await seedPlans(dataSource);
    // Seed products and categories for demo storefront
    await seedProducts(dataSource);
    await seedCategories(dataSource);

    // Seed user 1 with free plan
    await seedUserSubscription(dataSource, 1, 'free');

    logger.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
