import { Cache } from '@nestjs/cache-manager';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from 'src/common/utils/http-service';
import { FacebookEventsGateway } from 'src/facebook-events/facebook-events.gateway';
import {
  Notification,
  NotificationType,
} from 'src/notifications/entities/notification.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { FacebookPage } from './entities/facebook-page.entity';
import {
  ExchangeFacebookAccessTokenResponse,
  FacebookPagesResponse,
} from './interfaces/facebook-page.interface';
import {
  CommentVerb,
  FormattedWebhookCommentEvent,
  FormattedWebhookEvents,
  FormattedWebhookMessageEvent,
  WebhookEntry,
} from './interfaces/facebook-webhook.interface';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly httpService: HttpService;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FacebookPage)
    private readonly facebookPageRepo: Repository<FacebookPage>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly cacheManager: Cache,
    private readonly eventsGateway: FacebookEventsGateway,
  ) {
    this.httpService = new HttpService({
      baseUrl: process.env.FACEBOOK_GRAPH_API_BASE_URL,
      timeout: 5000, // 5 seconds timeout
    });
  }

  async getUserPages(facebookId: string): Promise<FacebookPage[]> {
    // Try to get from cache first
    const cacheKey = `facebook_pages:${facebookId}`;
    const cachedPages: FacebookPage[] = await this.cacheManager.get(cacheKey);

    if (cachedPages) {
      this.logger.debug(
        `Returning cached Facebook pages for user ${facebookId}`,
      );
      return cachedPages;
    }

    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.facebook_pages', 'facebookPage')
      .addSelect('user.fb_access_token')
      .where('user.facebookId = :facebookId', { facebookId })
      .getOne();

    if (!user || !user.fb_access_token) {
      this.logger.warn(
        `User with facebookId ${facebookId} missing Facebook access token.`,
      );
      throw new UnauthorizedException('Facebook access token not found');
    }

    // Check if we need to refresh the pages
    const shouldRefreshPages = await this.shouldRefreshPages(user);

    if (!shouldRefreshPages) {
      const pages = await this.facebookPageRepo.find({
        where: { user: { facebookId } },
        select: { access_token: true, page_id: true },
      });

      // Cache the results
      await this.cacheManager.set(cacheKey, pages, this.CACHE_TTL);
      return pages;
    }

    try {
      const pages = await this.fetchAndUpdatePages(user);

      // Cache the results
      await this.cacheManager.set(cacheKey, pages, this.CACHE_TTL);
      return pages;
    } catch (error) {
      this.logger.error(
        `Failed to fetch Facebook pages for user with facebook ID ${facebookId}: ${error.message}`,
      );
      throw new UnauthorizedException('Failed to fetch Facebook pages');
    }
  }

  private async shouldRefreshPages(user: User): Promise<boolean> {
    // Add a last_updated column to FacebookPage entity
    const lastUpdatedPage = await this.facebookPageRepo.findOne({
      where: { user: { id: user.id } },
      order: { last_updated: 'DESC' },
    });

    if (!lastUpdatedPage) return true;

    const refreshThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeSinceLastUpdate =
      Date.now() - lastUpdatedPage.last_updated.getTime();

    return timeSinceLastUpdate > refreshThreshold;
  }

  private async fetchAndUpdatePages(user: User): Promise<FacebookPage[]> {
    const fields = 'id,name,access_token,category';
    const limit = 100;

    const [response, error] = await this.httpService.get<FacebookPagesResponse>(
      '/me/accounts',
      {
        access_token: user.fb_access_token,
        fields,
        limit,
      },
    );

    if (error || !response.data) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const existingPages = await this.facebookPageRepo.find({
      where: { user: { id: user.id } },
    });

    const pagesToUpdate: FacebookPage[] = [];
    const pagesToCreate: FacebookPage[] = [];

    for (const pageData of response.data) {
      const existingPage = existingPages.find(
        (existing) => existing.page_id === pageData.id,
      );

      if (existingPage) {
        // Update existing page
        existingPage.name = pageData.name;
        existingPage.access_token = pageData.access_token;
        existingPage.category = pageData.category;
        existingPage.last_updated = new Date();
        pagesToUpdate.push(existingPage);
      } else {
        // Create new page
        const newPage = this.facebookPageRepo.create({
          page_id: pageData.id,
          name: pageData.name,
          access_token: pageData.access_token,
          category: pageData.category,
          user,
          last_updated: new Date(),
        });
        pagesToCreate.push(newPage);
      }
    }

    // Save updates and new pages
    await Promise.all([
      this.facebookPageRepo.save(pagesToUpdate),
      this.facebookPageRepo.save(pagesToCreate),
    ]);

    return [...pagesToUpdate, ...pagesToCreate];
  }

  // exchange short-lived access token for long-lived access token
  async getLongLivedAccessToken(facebookId: string): Promise<void> {
    let errorMsg = '';
    try {
      const user = await this.userRepo
        .createQueryBuilder('user')
        .addSelect('user.fb_access_token')
        .where('user.facebookId = :facebookId', { facebookId })
        .getOne();

      if (!user || !user.fb_access_token) {
        this.logger.warn(
          `User with facebookId ${facebookId} missing Facebook access token.`,
        );
        throw new UnauthorizedException('Facebook access token not found');
      }

      const accessToken = user.fb_access_token;
      // const fields = 'id,name,access_token,category';
      //https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=&client_secret=&fb_exchange_token=

      // Utilize the enhanced HttpService to pass query parameters
      const [response, error] =
        await this.httpService.get<ExchangeFacebookAccessTokenResponse>(
          '/oauth/access_token',
          {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: accessToken,
          },
        );

      if (error || !response.access_token) {
        errorMsg = `Failed to exchange short-lived access token for long-lived access token for user with facebook ID ${facebookId}.`;
        this.logger.warn(errorMsg);
        throw new UnauthorizedException(errorMsg);
      }

      await this.userRepo.update(
        { facebookId },
        { fb_access_token: response.access_token },
      );
    } catch (error) {
      errorMsg = `Failed to exchange short-lived access token for long-lived access token for user with facebook ID ${facebookId}: ${error.message}`;
      this.logger.error(errorMsg);
      throw new UnauthorizedException(errorMsg);
    }
  }

  // publish post to facebook
  async publishPost(post: Post, page_id: string): Promise<any> {
    const formattedPost = {
      message: `${post.title}\n\n${post.content || ''}`,
      link: post.media_url,
    };

    const facebookPage = await this.facebookPageRepo.findOne({
      where: { page_id },
      select: ['access_token'],
    });

    const [response, error] = await this.httpService.post(
      `/${page_id}/feed`,
      formattedPost,
      {
        access_token: facebookPage.access_token,
      },
    );

    if (error) {
      this.logger.error('Failed to publish post:', error);
      throw new InternalServerErrorException('Failed to publish post');
    }

    return response;
  }

  async handleWebhook(body: any) {
    this.logger.log('Webhook Event Received:', JSON.stringify(body, null, 2));

    if (body.object !== 'page') {
      return;
    }

    const formattedEvents = await this.processEntries(body.entry);

    const user = await this.userRepo.findOne({
      where: { facebook_pages: { page_id: formattedEvents[0].page_id } },
      relations: { facebook_pages: true },
    });

    if (!user) {
      this.logger.warn(
        `User with page ID ${formattedEvents[0].page_id} not found.`,
      );
      return;
    }

    this.eventsGateway.sendToClient(user.facebookId, formattedEvents[0]);
  }

  private async processEntries(
    entries: WebhookEntry[],
  ): Promise<FormattedWebhookEvents[]> {
    const formattedEvents: FormattedWebhookEvents[] = [];

    for (const entry of entries) {
      const messagingEvents = await this.processMessagingEvents(
        entry.messaging || [],
      );
      const changeEvents = await this.processChangeEvents(entry.changes || []);

      formattedEvents.push(...messagingEvents, ...changeEvents);
    }

    return formattedEvents;
  }

  private async processMessagingEvents(
    events: any[],
  ): Promise<FormattedWebhookEvents[]> {
    const formattedEvents: FormattedWebhookEvents[] = [];

    for (const event of events) {
      this.logger.log('Message event:', event);

      if (!this.isValidMessageEvent(event)) {
        continue;
      }

      const formattedEvent = this.formatWebhookEvent(event);
      if (formattedEvent) {
        formattedEvents.push(formattedEvent);
        if (formattedEvent.type === NotificationType.MESSAGE)
          await this.createMessageNotification(formattedEvent);
      }
    }

    return formattedEvents;
  }

  private async processChangeEvents(
    changes: any[],
  ): Promise<FormattedWebhookEvents[]> {
    const formattedEvents: FormattedWebhookEvents[] = [];

    for (const change of changes) {
      this.logger.log('Change event:', change);

      const formattedEvent = this.formatWebhookEvent(change);
      if (formattedEvent) {
        formattedEvents.push(formattedEvent);
        if (formattedEvent.type === NotificationType.COMMENT)
          await this.createChangeNotification(formattedEvent);
      }
    }

    return formattedEvents;
  }

  private isValidMessageEvent(event: any): boolean {
    return event.recipient && event.recipient.id;
  }

  private async createMessageNotification(
    event: FormattedWebhookMessageEvent,
  ): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { facebook_pages: { page_id: event.page_id } },
      relations: { facebook_pages: true },
    });

    if (user) {
      const newNotification = this.notificationRepo.create({
        content: event.content,
        type: event.type,
        user,
        facebook_page: user.facebook_pages.find(
          (page) => page.page_id === event.page_id,
        ),
        sender_id: event.sender_id,
      });

      await this.notificationRepo.save(newNotification);
    }
  }

  private async createChangeNotification(
    event: FormattedWebhookCommentEvent,
  ): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { facebook_pages: { page_id: event.page_id } },
      relations: { facebook_pages: true },
    });

    if (user) {
      const newNotification = this.notificationRepo.create({
        content: event.content,
        type: event.type,
        user,
        facebook_page: user.facebook_pages.find(
          (page) => page.page_id === event.page_id,
        ),
        sender_id: event.sender_id,
        sender_name: event.sender_name,
      });

      await this.notificationRepo.save(newNotification);
    }
  }

  // Helper function to extract page_id
  private extractPageId(post_id: string): string {
    return post_id.split('_')[0];
  }

  // Updated formatter
  private formatWebhookEvent(event: any): FormattedWebhookEvents | null {
    try {
      // Handle message events
      if (event.message) {
        return {
          type: NotificationType.MESSAGE,
          content: event.message.text || '',
          sender_id: event.sender.id,
          timestamp: event.timestamp,
          message_id: event.message.mid,
          page_id: event.recipient.id, // For messages, recipient_id is the page_id
        };
      }

      // Handle comment events
      if (event.value && event.value.item === NotificationType.COMMENT) {
        const page_id = this.extractPageId(event.value.post_id);

        return {
          type: NotificationType.COMMENT,
          content: event.value.message || '',
          sender_id: event.value.from.id,
          sender_name: event.value.from.name,
          timestamp: event.value.created_time,
          page_id,
          post: {
            id: event.value.post.id,
            status_type: event.value.post.status_type,
            is_published: event.value.post.is_published,
            updated_time: event.value.post.updated_time,
            permalink_url: event.value.post.permalink_url,
            promotion_status: event.value.post.promotion_status,
          },
          post_id: event.value.post_id,
          comment_id: event.value.comment_id,
          parent_id: event.value.parent_id,
          verb: event.value.verb as CommentVerb,
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Error formatting webhook event:', error);
      return null;
    }
  }
}
