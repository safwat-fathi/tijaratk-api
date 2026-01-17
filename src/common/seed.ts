import { Logger } from '@nestjs/common';
import { seedRoles } from 'src/auth/roles.seed';
import { seedPermissions } from 'src/auth/permissions.seed';
import { seedPlans } from 'src/billing/plans.seed';
import dataSource from 'src/config/orm.config';
import { seedCategories } from 'src/categories/categories.seed';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Seeding...');

  await dataSource.initialize();

  try {
    // Seed roles first (permissions depend on roles)
    await seedRoles(dataSource);
    // Seed permissions and assign to roles
    await seedPermissions(dataSource);
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
