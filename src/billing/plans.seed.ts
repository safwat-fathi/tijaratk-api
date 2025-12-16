import { Logger } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

import { Addon, AddonType } from '../billing/entities/addon.entity';
import { Plan } from '../billing/entities/plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';

const logger = new Logger('SeedPlans');

export async function seedPlans(dataSource: DataSource) {
  const planRepository = dataSource.getRepository(Plan);

  const plansData: Omit<
    Plan,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'subscriptions'
  >[] = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for just starting out',
      price: 0,
      billing_cycle: 'monthly',
      max_products: 10,
      max_posts_per_month: 5,
      max_messages_per_month: 50,
      max_staff_users: 1,
      has_custom_domain: false,
      has_theme_access: false,
      branding_removed: false,
      available_themes_count: 0,
      available_color_palettes: 20,
      is_active: true,
      display_order: 1,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses',
      price: 1500, // $15.00
      billing_cycle: 'monthly',
      max_products: null, // Unlimited
      max_posts_per_month: 50,
      max_messages_per_month: 3000,
      max_staff_users: 3,
      has_custom_domain: true,
      has_theme_access: true,
      branding_removed: true,
      available_themes_count: 10,
      available_color_palettes: 20,
      is_active: true,
      display_order: 2,
    },
  ];

  for (const planData of plansData) {
    const exists = await planRepository.findOne({
      where: { slug: planData.slug },
    });
    if (!exists) {
      await planRepository.save(planRepository.create(planData));
      logger.log(`Seeded plan: ${planData.name}`);
    }
  }

  // Seed Addons
  const addonRepository = dataSource.getRepository(Addon);
  const addonsData = [
    {
      name: 'Extra Message Pack',
      slug: 'message-pack',
      description: 'Add 100 extra messages',
      addon_type: AddonType.MESSAGE_PACK,
      price: 250, // $2.50
      billing_cycle: 'one_time',
      provides_quantity: 100,
      available_for_plans: ['free', 'pro'],
    },
    {
      name: 'Extra Staff Seat',
      slug: 'staff-seat',
      description: 'Add 1 extra staff member',
      addon_type: AddonType.STAFF_SEAT,
      price: 500, // $5.00
      billing_cycle: 'monthly',
      provides_quantity: 1,
      available_for_plans: ['free', 'pro'],
    },
    {
      name: 'Extra Products Pack',
      slug: 'product-pack',
      description: 'Add 25 extra products',
      addon_type: AddonType.PRODUCT_PACK,
      price: 500, // $5.00
      billing_cycle: 'monthly',
      provides_quantity: 25,
      available_for_plans: ['free'],
    },
    {
      name: 'Extra Posts Pack',
      slug: 'posts-pack',
      description: 'Add 50 extra Facebook posts',
      addon_type: AddonType.POSTS_PACK,
      price: 300, // $3.00
      billing_cycle: 'monthly',
      provides_quantity: 50,
      available_for_plans: ['free', 'pro'],
    },
  ];

  for (const addonData of addonsData) {
    const exists = await addonRepository.findOne({
      where: { slug: addonData.slug },
    });
    if (!exists) {
      await addonRepository.save(addonRepository.create(addonData as any));
      logger.log(`Seeded addon: ${addonData.name}`);
    }
  }

  logger.log('Seeding plans and addons completed.');
}

export async function seedUserSubscription(
  dataSource: DataSource,
  userId: number,
  planSlug: string,
) {
  const userRepository = dataSource.getRepository(User);
  const planRepository = dataSource.getRepository(Plan);
  const subscriptionRepository = dataSource.getRepository(UserSubscription);

  const user = await userRepository.findOne({ where: { id: userId as any } });
  if (!user) {
    logger.warn(
      `User with ID ${userId} not found. Skipping subscription seeding.`,
    );
    return;
  }

  const plan = await planRepository.findOne({ where: { slug: planSlug } });
  if (!plan) {
    logger.warn(
      `Plan with slug ${planSlug} not found. Skipping subscription seeding.`,
    );
    return;
  }

  const existingSubscription = await subscriptionRepository.findOne({
    where: { userId, status: 'active' },
  });

  if (existingSubscription) {
    logger.log(`User ${userId} already has an active subscription.`);
    return;
  }

  // Create subscription
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const subscription = subscriptionRepository.create({
    userId,
    plan,
    status: 'active',
    current_period_start: now,
    current_period_end: nextMonth,
    cancel_at_period_end: false,
  });

  await subscriptionRepository.save(subscription);
  logger.log(`Seeded ${planSlug} subscription for user ${userId}`);
}
