import { Cache } from '@nestjs/cache-manager';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from 'src/common/utils/http-service';
import { FacebookEventsGateway } from 'src/facebook-events/facebook-events.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { FacebookPage } from './entities/facebook-page.entity';
import {
  ExchangeFacebookAccessTokenResponse,
  FacebookPagesResponse,
} from './interfaces/facebook-page.interface';
import {
  FormattedWebhookEvent,
  WebhookEntry,
} from './interfaces/facebook-webhook.interface';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly httpService: HttpService;
  private readonly notificationsService: NotificationsService;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FacebookPage)
    private readonly facebookPageRepo: Repository<FacebookPage>,
    private readonly cacheManager: Cache, // Inject cache manager
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
        select: { id: true, access_token: true, page_id: true },
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
      //https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=&client_secret=&fb_exchange_token=

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

  // async handleWebhook(body: any) {
  //   this.logger.log('Webhook Event Received:', JSON.stringify(body, null, 2));

  //   const formattedEvents: FormattedWebhookEvent[] = [];

  //   // Process webhook events and create notifications accordingly.
  //   // For this example, we assume that the webhook entry contains events with recipient or change info that maps to a user's facebookId.
  //   if (body.object === 'page') {
  //     for (const entry of body.entry) {
  //       // Process messaging events
  //       if (entry.messaging) {
  //         for (const event of entry.messaging) {
  //           this.logger.log('Message event:', event);
  //           if (event.recipient && event.recipient.id) {
  //             // format the event
  //             const formattedEvent = this.formatWebhookEvent(event);
  //             if (formattedEvent) formattedEvents.push(formattedEvent);

  //             // create notification to user
  //             const user = await this.userRepo.findOne({
  //               where: { facebookId: event.recipient.id },
  //             });
  //             if (user) {
  //               const message = `New message event: ${JSON.stringify(event)}`;
  //               await this.notificationsService.createNotification(
  //                 user,
  //                 message,
  //               );
  //             }
  //           }
  //         }
  //       }
  //       // Process change events
  //       if (entry.changes) {
  //         for (const change of entry.changes) {
  //           // format the event
  //           this.logger.log('Change event:', change);
  //           const formattedEvent = this.formatWebhookEvent(change);
  //           if (formattedEvent) formattedEvents.push(formattedEvent);

  //           // In this example, we assume change.value.userId maps to the user's facebookId.
  //           if (change.value && change.value.userId) {
  //             const user = await this.userRepo.findOne({
  //               where: { facebookId: change.value.userId },
  //             });
  //             if (user) {
  //               const message = `New change event: ${JSON.stringify(change)}`;
  //               await this.notificationsService.createNotification(
  //                 user,
  //                 message,
  //               );
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   this.eventsGateway.broadcast(formattedEvents);
  // }

  async handleWebhook(body: any) {
    this.logger.log('Webhook Event Received:', JSON.stringify(body, null, 2));

    if (body.object !== 'page') {
      return;
    }

    const formattedEvents = await this.processEntries(body.entry);
    this.eventsGateway.broadcast(formattedEvents);
  }

  private async processEntries(
    entries: WebhookEntry[],
  ): Promise<FormattedWebhookEvent[]> {
    const formattedEvents: FormattedWebhookEvent[] = [];

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
  ): Promise<FormattedWebhookEvent[]> {
    const formattedEvents: FormattedWebhookEvent[] = [];

    for (const event of events) {
      this.logger.log('Message event:', event);

      if (!this.isValidMessageEvent(event)) {
        continue;
      }

      const formattedEvent = this.formatWebhookEvent(event);
      if (formattedEvent) {
        formattedEvents.push(formattedEvent);
      }

      await this.createMessageNotification(event);
    }

    return formattedEvents;
  }

  private async processChangeEvents(
    changes: any[],
  ): Promise<FormattedWebhookEvent[]> {
    const formattedEvents: FormattedWebhookEvent[] = [];

    for (const change of changes) {
      this.logger.log('Change event:', change);

      const formattedEvent = this.formatWebhookEvent(change);
      if (formattedEvent) {
        formattedEvents.push(formattedEvent);
      }

      await this.createChangeNotification(change);
    }

    return formattedEvents;
  }

  private isValidMessageEvent(event: any): boolean {
    return event.recipient && event.recipient.id;
  }

  private async createMessageNotification(event: any): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { facebookId: event.recipient.id },
    });

    if (user) {
      const message = `New message event: ${JSON.stringify(event)}`;
      await this.notificationsService.createNotification(user, message);
    }
  }

  private async createChangeNotification(change: any): Promise<void> {
    if (!change.value?.userId) {
      return;
    }

    const user = await this.userRepo.findOne({
      where: { facebookId: change.value.userId },
    });

    if (user) {
      const message = `New change event: ${JSON.stringify(change)}`;
      await this.notificationsService.createNotification(user, message);
    }
  }

  private formatWebhookEvent(event: any): FormattedWebhookEvent | null {
    try {
      // Handle message events
      if (event.message) {
        return {
          type: 'message',
          content: event.message.text || '',
          sender_id: event.sender.id,
          recipient_id: event.recipient.id,
          timestamp: event.timestamp,
          page_id: event.recipient.id, // For page messages, recipient ID is the page ID
        };
      }

      // Handle comment events (from changes array)
      if (event.value && event.value.item === 'comment') {
        return {
          type: 'comment',
          content: event.value.message || event.value.comment_text || '',
          sender_id: event.value.from.id,
          post_id: event.value.post_id,
          comment_id: event.value.comment_id,
          parent_comment_id: event.value.parent_id,
          page_id: event.value.page_id,
          timestamp: event.value.created_time,
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Error formatting webhook event:', error);
      return null;
    }
  }
}
