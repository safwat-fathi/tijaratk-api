import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import dataSource from './config/orm.config';
import { FacebookModule } from './facebook/facebook.module';
import { FacebookEventsModule } from './facebook-events/facebook-events.module';
import { FacebookPageSubscriptionModule } from './facebook-page-subscription/facebook-page-subscription.module';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { ProductsModule } from './products/products.module';
import { StorefrontsModule } from './storefronts/storefronts.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UsersModule } from './users/users.module';
import { BillingModule } from './billing/billing.module';
import { CategoriesModule } from './categories/categories.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.${ENV}` }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // Default TTL is 1 hour
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({ ...dataSource.options, autoLoadEntities: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ProductsModule,
    FacebookModule,
    FacebookPageSubscriptionModule,
    FacebookEventsModule,
    NotificationsModule,
    PostsModule,
    OrdersModule,
    StorefrontsModule,
    // SubscriptionModule,
    CategoriesModule,
    BillingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
