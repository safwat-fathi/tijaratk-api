// src/posts/posts.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookService } from 'src/facebook/facebook.service';
import { Product } from 'src/products/entities/product.entity';
import { LessThanOrEqual, Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly facebookService: FacebookService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Ensure the selected product exists.
    const product = await this.productRepository.findOne({
      where: { id: createPostDto.product_id },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createPostDto.product_id} not found`,
      );
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      media_url: createPostDto.media_url,
      scheduled_at: createPostDto.scheduled_at
        ? new Date(createPostDto.scheduled_at)
        : null,
      product,
      published: false,
    });
    const savedPost = await this.postRepository.save(post);

    // If not scheduled or the scheduled time is in the past, publish immediately.
    if (
      !savedPost.scheduled_at ||
      savedPost.scheduled_at.getTime() <= Date.now()
    ) {
      await this.publish(savedPost, createPostDto.page_id);
      savedPost.published = true;
      await this.postRepository.save(savedPost);
    }

    return savedPost;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    Object.assign(post, updatePostDto);
    if (updatePostDto.scheduled_at) {
      post.scheduled_at = new Date(updatePostDto.scheduled_at);
      // Mark the post as unpublished if rescheduled.
      post.published = false;
    }
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  // Calls the FacebookService to publish the post on Facebook.
  async publish(post: Post, page_id: string): Promise<void> {
    try {
      const fbResponse = await this.facebookService.publishPost(post, page_id);
      post.facebook_post_id = fbResponse.id;
      this.logger.log(
        `Post ${post.id} published to Facebook with ID ${fbResponse.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish post ${post.id} to Facebook: ${error.message}`,
      );
    }
  }

  // ! needs work
  // Scheduler: runs every minute and publishes posts whose scheduled time has arrived.
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts(): Promise<void> {
    const now = new Date();
    const posts = await this.postRepository.find({
      where: {
        scheduled_at: LessThanOrEqual(now),
        published: false,
      },
      relations: { facebook_page: true },
    });

    if (posts.length === 0) return;

    for (const post of posts) {
      await this.publish(post, post.facebook_page.page_id);
      post.published = true;
      await this.postRepository.save(post);
    }
  }
}
