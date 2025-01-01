import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/db.config';
import { StatusController } from './status/status.controller';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { MessagesModule } from './messages/messages.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 1000 * 60, // 1 minute
        limit: 10, // 10 requests
      },
    ]),
    TagsModule,
    MessagesModule,
    CommentsModule,
    ProductsModule,
    CustomersModule,
    PostsModule,
    UsersModule,
  ],
  controllers: [StatusController],
})
export class AppModule {}
