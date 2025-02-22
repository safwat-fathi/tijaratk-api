import { Cache } from '@nestjs/cache-manager';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from 'src/common/utils/http-service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { FacebookPage } from './entities/facebook-page.entity';
import {
  ExchangeFacebookAccessTokenResponse,
  FacebookPagesResponse,
} from './interfaces/facebook-page.interface';

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
    private readonly cacheManager: Cache, // Inject cache manager
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
}
