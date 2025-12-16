import { Logger } from '@nestjs/common';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

import { Product, ProductStatus } from './entities/product.entity';

const logger = new Logger('SeedProducts');

function buildSlug(base: string) {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureSeedUser(dataSource: DataSource): Promise<User | null> {
  const userRepository = dataSource.getRepository(User);
  const subscriptionRepository = dataSource.getRepository(Subscription);

  const existingUser = await userRepository.findOne({
    where: {},
  });

  if (existingUser) {
    return existingUser;
  }

  const fallbackSubscription = await subscriptionRepository.findOne({
    where: { name: 'Free' },
  });

  const subscription =
    fallbackSubscription ||
    (await subscriptionRepository.findOne({ where: {}, order: { id: 'ASC' } }));

  if (!subscription) {
    logger.error('No subscription plans found; skipping product seed.');
    return null;
  }

  const demoUser = userRepository.create({
    facebookId: 'demo-storefront-user',
    first_name: 'Demo',
    last_name: 'Merchant',
  });

  return userRepository.save(demoUser);
}

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);

  const user = await ensureSeedUser(dataSource);

  if (!user) {
    return;
  }

  const sampleProducts = Array.from({ length: 10 }).map((_, index) => {
    const name = `Sample Product ${index + 1}`;
    const slug = buildSlug(name);

    return {
      name,
      slug,
      sku: `SKU-${(index + 1).toString().padStart(4, '0')}`,
      price: 25 + index * 5,
      stock: 20 + index * 3,
      status: ProductStatus.ACTIVE,
    } satisfies Partial<Product>;
  });

  for (const product of sampleProducts) {
    const existing = await productRepository.findOne({
      where: {
        slug: product.slug,
        user: { id: user.id },
      },
      relations: { user: true },
    });

    if (existing) {
      continue;
    }

    const entity = productRepository.create({
      ...product,
      user,
    });

    await productRepository.save(entity);
  }

  logger.log('Seeded sample products.');
}
