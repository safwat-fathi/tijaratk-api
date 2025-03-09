import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'src/common/enums/events.enum';
import { UserLoginEvent } from 'src/events/user-login.event';
import { FacebookService } from 'src/facebook/facebook.service';
import { FacebookPageSubscriptionService } from 'src/facebook-page-subscription/facebook-page-subscription.service';

import { UsersService } from '../users.service';

// users events listener class
@Injectable()
export class UserEventsListener {
  private readonly logger: Logger = new Logger(UserEventsListener.name);

  constructor(
    private readonly facebookService: FacebookService,
    private readonly facebookPageSubscriptionService: FacebookPageSubscriptionService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent(Events.USER_LOGGED_IN)
  async handleUserLoggedInEvent(payload: UserLoginEvent) {
    // Retrieve the user's pages, for example:
    const user = await this.usersService.getUserById(payload.userId);
    const pages = await this.facebookService.getUserPages(user.facebookId);

    // Process each page asynchronously.
    pages.forEach((page) => {
      // This call to subscribePage is handled asynchronously.
      this.facebookPageSubscriptionService
        .subscribePage(page.page_id, page.access_token, user.id)
        .catch((err) => {
          // Handle or log the error without affecting the login process.
          this.logger.error(
            `Failed to subscribe page ${page.page_id} for user ${user.id}: ${err.message}`,
          );
        });
    });
  }
}
