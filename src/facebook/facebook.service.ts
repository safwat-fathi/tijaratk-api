import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { FetchWrapper } from 'src/common/utils/fetch-wrapper';
import { Repository } from 'typeorm';

import { FacebookPage } from './entities/facebook-page.entity';
import {
  ExchangeFacebookAccessTokenResponse,
  FacebookPagesResponse,
} from './interfaces/facebook-page.interface';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly fetch: FetchWrapper;

  // constructor(private readonly usersService: UsersService) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(FacebookPage)
    private readonly facebookPageRepo: Repository<FacebookPage>,
  ) {
    this.fetch = new FetchWrapper({
      baseUrl: process.env.FACEBOOK_API_BASE_URL,
      timeout: 5000, // 5 seconds timeout
    });
  }

  /**
   * Fetches the Facebook pages associated with a user.
   * @param facebookId The ID of the user.
   * @returns An object containing Facebook pages data.
   */
  async getUserPages(facebookId: string) {
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

    const accessToken = user.fb_access_token;

    const fields = 'id,name,access_token,category';
    const limit = 100;
    try {
      // Utilize the enhanced FetchWrapper to pass query parameters
      const response = await this.fetch.get<FacebookPagesResponse>(
        '/me/accounts',
        {
          access_token: accessToken,
          fields,
          limit,
        },
      );

      if (!response.data) {
        this.logger.warn(
          `Failed to fetch Facebook pages for user with facebook ID ${facebookId}.`,
        );
        throw new UnauthorizedException('Failed to fetch Facebook pages');
      }

      // ?? should i check if the page is already in the database

      const existingPages = await this.facebookPageRepo.find({
        where: { user: { facebookId } },
      });

      const newPages: FacebookPage[] = [];
      for (const page of response.data) {
        const existingPage = existingPages.find(
          (existingPage) => existingPage.page_id === page.id,
        );

        if (existingPage) continue;

        const newPage = this.facebookPageRepo.create({
          page_id: page.id,
          name: page.name,
          access_token: page.access_token,
          category: page.category,
          user,
        });

        newPages.push(newPage);
      }

      await this.facebookPageRepo.save(newPages);
    } catch (error) {
      this.logger.error(
        `Failed to fetch Facebook pages for user with facebook ID ${facebookId}: ${error.message}`,
      );
      throw new UnauthorizedException('Failed to fetch Facebook pages');
    }
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

      // Utilize the enhanced FetchWrapper to pass query parameters
      const response =
        await this.fetch.get<ExchangeFacebookAccessTokenResponse>(
          '/oauth/access_token',
          {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: accessToken,
          },
        );

      if (!response.access_token) {
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
}
