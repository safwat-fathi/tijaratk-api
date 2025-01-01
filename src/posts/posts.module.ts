import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
