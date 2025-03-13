import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookService } from 'src/facebook/facebook.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Product, User, FacebookPage, Notification]),
  ],
  controllers: [PostsController],
  providers: [PostsService, FacebookService],
})
export class PostsModule {}
