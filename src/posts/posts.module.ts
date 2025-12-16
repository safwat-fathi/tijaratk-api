import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookModule } from 'src/facebook/facebook.module';
import { FacebookService } from 'src/facebook/facebook.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { ImageProcessorService } from 'src/common/services/image-processor.service';

import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Product, User, FacebookPage, Notification]),
    FacebookModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, FacebookService, ImageProcessorService],
})
export class PostsModule {}
