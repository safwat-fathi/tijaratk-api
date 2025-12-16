import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/common/enums/events.enum';
import { HttpService } from 'src/common/utils/http-service';
import { UserLoginEvent } from 'src/events/user-login.event';
import { Repository } from 'typeorm';

import { FacebookPage } from './entities/facebook-page.entity';

@Injectable()
export class FacebookPollingService {
  private readonly logger = new Logger(FacebookPollingService.name);
  private lastCheckedTimestamp: number;
  private httpService: HttpService;

  // Map to store intervals for each user by their ID
  private pollingIntervals = new Map<number, NodeJS.Timeout>();

  constructor(
    @InjectRepository(FacebookPage)
    private readonly facebookPageRepo: Repository<FacebookPage>,
  ) {
    // Initialize your last-checked timestamp
    this.lastCheckedTimestamp = Math.floor(Date.now() / 1000);

    // Create a HttpService instance with any desired options
    // (baseUrl, default timeout, etc.)
    this.httpService = new HttpService({
      baseUrl: process.env.FACEBOOK_GRAPH_API_BASE_URL,
      timeout: 5000, // 5 seconds
    });
  }

  @OnEvent(Events.USER_LOGGED_OUT)
  async handleUserLogoutEvent(payload: UserLoginEvent) {
    this.logger.debug(
      `Received ${Events.USER_LOGGED_OUT} event for userId=${payload.userId}`,
    );

    const intervalId = this.pollingIntervals.get(payload.userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(payload.userId);
      this.logger.debug(
        `Cleared polling interval for userId=${payload.userId}`,
      );
    }
  }

  @OnEvent(Events.USER_LOGGED_IN)
  async handleUserLoginEvent(payload: UserLoginEvent) {
    this.logger.debug(
      `Received user.logged_in event for userId=${payload.userId}`,
    );
    await this.pollFacebookFeed(payload.userId);

    if (!this.pollingIntervals.has(payload.userId)) {
      const intervalId = setInterval(
        () => {
          this.pollFacebookFeed(payload.userId);
        },
        5 * 60 * 1000,
      ); // 5 minutes
      this.pollingIntervals.set(payload.userId, intervalId);
    }
  }

  async pollFacebookFeed(userId: number) {
    this.logger.debug('Polling Facebook Graph API (using HttpService)...');
    try {
      const pages = await this.facebookPageRepo.find({
        where: { user: { id: userId } },
        select: ['page_id', 'access_token'],
        relations: { user: true },
      });
      if (!pages.length) {
        this.logger.log(`No Facebook pages found for userId=${userId}.`);
        return;
      }
      // 2. For each page, call the Facebook API with the stored token
      for (const page of pages) {
        this.logger.debug(`Fetching feed for pageId=${page.page_id}...`);

        const [response, error] = await this.httpService.get<{ data: any[] }>(
          `/${page.page_id}/feed`,
          {
            access_token: page.access_token,
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fields: 'id,message,created_time,attachments',
            // since: this.lastCheckedTimestamp,
          },
        );

        if (error) throw error;

        // 3. If new data found, process it
        if (response?.data?.length) {
          // console.log("🚀 ~ :78 ~ FacebookPollingService ~ pollFacebookFeed ~ response:", response.data.length)
          this.processNewPosts(response.data);
        }
      }

      // 4. Update timestamp so we only fetch new data next time
      this.lastCheckedTimestamp = Math.floor(Date.now() / 1000);
    } catch (error) {
      this.logger.error(
        `Error polling Facebook API for userId=${userId}: ${error.message}`,
      );
    }
  }

  private processNewPosts(posts: any[]) {
    for (const post of posts) {
      this.logger.log(`New Post found: ${post.id}`);
      // ... handle new post data as needed (DB insert, notifications, etc.)
    }
  }
}
