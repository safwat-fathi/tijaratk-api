import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import dataSource from './config/orm.config';
import { FacebookModule } from './facebook/facebook.module';
import { FacebookEventsModule } from './facebook-events/facebook-events.module';
import { FacebookPageSubscriptionModule } from './facebook-page-subscription/facebook-page-subscription.module';
import { HealthController } from './health/health.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

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
    AuthModule,
    ProductsModule,
    FacebookModule,
    FacebookPageSubscriptionModule,
    UsersModule,
    FacebookEventsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
