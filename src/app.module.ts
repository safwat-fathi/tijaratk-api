import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/db.config';
import { FacebookModule } from './facebook/facebook.module';
import { HealthController } from './health/health.controller';
import { ProductsModule } from './products/products.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.${ENV}` }),
    TypeOrmModule.forRoot(databaseConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    AuthModule,
    ProductsModule,
    FacebookModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
