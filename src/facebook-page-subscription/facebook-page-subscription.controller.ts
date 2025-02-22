import { Controller } from '@nestjs/common';

import { FacebookPageSubscriptionService } from './facebook-page-subscription.service';

@Controller('facebook-page-subscription')
export class FacebookPageSubscriptionController {
  constructor(
    private readonly facebookPageSubscriptionService: FacebookPageSubscriptionService,
  ) {}
}
