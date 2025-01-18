import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookService {
  // private readonly logger = new Logger(FacebookService.name);
  // private readonly fetch: FetchWrapper;

  // constructor(private readonly usersService: UsersService) {
  constructor() {
    // this.fetch = new FetchWrapper({
    //   baseUrl: process.env.FACEBOOK_API_BASE_URL,
    //   timeout: 5000, // 5 seconds timeout
    // });
  }

  /**
   * Fetches the Facebook pages associated with a user.
   * @param facebookId The ID of the user.
   * @returns An object containing Facebook pages data.
   */
  async getUserPages() {
    // const user = await this.usersService.findById(userId);
    // if (!user || !user.facebookAccessToken) {
    //   this.logger.warn(`User ID ${userId} missing Facebook access token.`);
    //   throw new UnauthorizedException('Facebook access token not found');
    // }
    // const accessToken = user.facebookAccessToken;
    // const fields = 'id,name,access_token,category';
    // const limit = 100;
    // try {
    //   // Utilize the enhanced FetchWrapper to pass query parameters
    //   const response = await this.fetch.get<FacebookPagesResponse>(
    //     '/me/accounts',
    //     {
    //       access_token: accessToken,
    //       fields,
    //       limit,
    //     },
    //   );
    //   return response;
    // } catch (error) {
    //   this.logger.error(
    //     `Failed to fetch Facebook pages for user ID ${userId}: ${error.message}`,
    //   );
    //   throw new UnauthorizedException('Failed to fetch Facebook pages');
    // }
  }
}
