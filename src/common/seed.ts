import { Logger } from '@nestjs/common';
import dataSource from 'src/config/orm.config';
import {
  DashboardType,
  Subscription,
  SupportType,
} from 'src/subscription/entities/subscription.entity';

async function bootstrap() {
  const logger = new Logger('Seed');
  logger.log('Seeding...');

  await dataSource.initialize();

  const subscriptionRepository = dataSource.getRepository(Subscription);

  const subscriptionPlans: Omit<
    Subscription,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
    | 'users'
    | 'additional_admins'
  >[] = [
    {
      name: 'Free',
      product_limit: 10,
      comment_message_limit: 50,
      price: 0,
      dashboard: DashboardType.BASIC,
      notifications: false,
      smart_classification: false,
      support: SupportType.NONE,
      post_limit: 20,
      description: 'Basic subscription',
    },
    {
      name: 'Starter',
      product_limit: 50,
      comment_message_limit: 500,
      price: 149,
      dashboard: DashboardType.BASIC,
      notifications: true,
      smart_classification: true,
      support: SupportType.EMAIL,
      post_limit: 200,
      description: 'Starter subscription',
    },
    {
      name: 'Pro',
      product_limit: null,
      comment_message_limit: 2000,
      price: 349,
      dashboard: DashboardType.ADVANCED,
      notifications: true,
      smart_classification: true,
      support: SupportType.CHAT,
      post_limit: 1000,
      description: 'Pro subscription',
    },
    {
      name: 'Enterprise',
      product_limit: null,
      comment_message_limit: null,
      price: 4800,
      dashboard: DashboardType.ADVANCED,
      notifications: true,
      smart_classification: true,
      support: SupportType.VIP,
      post_limit: null,
      description: 'Enterprise subscription',
    },
  ];

  try {
    await subscriptionRepository.save(subscriptionPlans);
    logger.log('Seeding completed successfully.');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
