import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookService } from 'src/facebook/facebook.service';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { ILike, LessThanOrEqual, Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto, SortOrder } from './dto/list-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(FacebookPage)
    private readonly facebookPageRepository: Repository<FacebookPage>,
    private readonly facebookService: FacebookService,
  ) {}

  async create(
    facebookId: string,
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    const { page_id, product_id, title, content, media_url, scheduled_at } =
      createPostDto;
    const user = await this.userRepository.findOne({
      where: { facebookId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${facebookId} not found`);
    }

    // Ensure the selected product exists.
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    // find the facebook page
    const facebook_page = await this.facebookPageRepository.findOne({
      where: { page_id: page_id },
    });
    if (!facebook_page) {
      throw new NotFoundException(`Facebook page with ID ${page_id} not found`);
    }

    const productCount = await this.productRepository.count({
      where: { id: product_id },
    });
    // Check subscription plan limits (assuming user.subscription is loaded)
    const subscription = user.subscription;
    if (
      subscription &&
      subscription.post_limit !== null &&
      productCount >= subscription.post_limit
    ) {
      throw new BadRequestException(
        'You have reached your post limit for your current subscription plan',
      );
    }

    const post = this.postRepository.create({
      title: title,
      content: content,
      media_url: media_url,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      product,
      is_published: false,
      facebook_page,
    });
    const savedPost = await this.postRepository.save(post);

    // If not scheduled or the scheduled time is in the past, publish immediately.
    if (
      !savedPost.scheduled_at ||
      savedPost.scheduled_at.getTime() <= Date.now()
    ) {
      await this.publish(savedPost, createPostDto.page_id);
      savedPost.is_published = true;
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
      post.is_published = false;
    }
    return await this.postRepository.save(post);
  }

  async findAll(listPostsDto: ListPostsDto) {
    const {
      page = 1,
      limit = 10,
      keyword,
      sortBy = SortOrder.NEWEST,
    } = listPostsDto;
    const skip = (page - 1) * limit;

    // Determine sort order
    const order = sortBy === SortOrder.NEWEST ? 'DESC' : 'ASC';

    // Build where clause for search
    const whereClause = keyword
      ? [{ title: ILike(`%${keyword}%`) }, { content: ILike(`%${keyword}%`) }]
      : undefined;

    // Retrieve data with pagination
    const [items, total] = await this.postRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { created_at: order },
      relations: { product: true, facebook_page: true },
    });

    // Return paginated response
    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      items,
    };
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

  // Scheduler: runs every minute and publishes posts whose scheduled time has arrived.
  @Cron(CronExpression.EVERY_30_MINUTES)
  async publishScheduledPosts(): Promise<void> {
    const now = new Date();
    const posts = await this.postRepository.find({
      where: {
        scheduled_at: LessThanOrEqual(now),
        is_published: false,
      },
      relations: { facebook_page: true },
    });

    if (posts.length === 0) return;

    for (const post of posts) {
      await this.publish(post, post.facebook_page.page_id);
      post.is_published = true;
      await this.postRepository.save(post);
    }
  }
}
