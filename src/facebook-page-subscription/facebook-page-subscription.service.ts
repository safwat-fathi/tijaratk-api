import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from 'src/common/utils/http-service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

import {
  FacebookPageSubscription,
  SubscribedFields,
} from './entities/facebook-page-subscription.entity';

@Injectable()
export class FacebookPageSubscriptionService {
  private readonly logger = new Logger(FacebookPageSubscriptionService.name);
  private readonly httpService: HttpService;

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(FacebookPageSubscription)
    private readonly subscriptionRepository: Repository<FacebookPageSubscription>,
  ) {
    this.httpService = new HttpService({
      baseUrl: process.env.FACEBOOK_GRAPH_API_BASE_URL,
      timeout: 5000, // 5 seconds timeout
    });
  }

  /**
   * Subscribe a page to the 'feed' field.
   * @param pageId - The Facebook Page ID.
   * @param pageAccessToken - The Page access token.
   * @param userId - The user ID associated with this page.
   */
  async subscribePage(
    pageId: string,
    pageAccessToken: string,
    userId: string,
  ): Promise<FacebookPageSubscription> {
    const user = await this.usersService.getUserById(userId);

    // First, check if we already have a record for this page subscription.
    let subscription = await this.subscriptionRepository.findOne({
      where: { page_id: pageId, user: { id: userId } },
    });
    if (subscription) {
      this.logger.log(
        `Page ${pageId} is already subscribed for user ${userId}`,
      );
      return subscription;
    }

    try {
      // Call the Facebook API to subscribe the page to the "feed" and "messages" fields.
      const [response, error] = await this.httpService.post<any>(
        `/${pageId}/subscribed_apps`,
        null,
        {
          access_token: pageAccessToken,
          subscribed_fields: 'feed,messages',
        },
      );

      if (error) throw error;

      if (response.data) {
        // Create and save a new subscription record.
        subscription = this.subscriptionRepository.create({
          page_id: pageId,
          user,
          subscribed_fields: [SubscribedFields.FEED, SubscribedFields.MESSAGES],
        });
        await this.subscriptionRepository.save(subscription);
        this.logger.log(
          `Successfully subscribed page ${pageId} for user ${userId}`,
        );
        return subscription;
      } else {
        this.logger.error(
          `Failed to subscribe page ${pageId}: ${JSON.stringify(response.data)}`,
        );
        throw new InternalServerErrorException('Failed to subscribe page.');
      }
    } catch (error) {
      this.logger.error(
        `Error subscribing page ${pageId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error subscribing page to feed.');
    }
  }

  /**
   * Optionally, check the current subscription status by calling the Graph API.
   */
  async checkSubscriptionStatus(
    pageId: string,
    pageAccessToken: string,
  ): Promise<any> {
    try {
      const [response, error] = await this.httpService.get<any>(
        `/${pageId}/subscribed_apps`,
        {
          access_token: pageAccessToken,
        },
      );

      if (error) throw error;

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error checking subscription status for page ${pageId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error checking subscription status.',
      );
    }
  }
}
