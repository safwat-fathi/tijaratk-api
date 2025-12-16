import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserSubscriptionsService } from '../services/user-subscriptions.service';
import { FEATURE_KEY, FeatureType } from './feature.decorator';

@Injectable()
export class FeatureAccessGuard implements CanActivate {
  private readonly logger = new Logger(FeatureAccessGuard.name);

  constructor(
    private reflector: Reflector,
    private userSubscriptionsService: UserSubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureType = this.reflector.getAllAndOverride<FeatureType>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!featureType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      return true;
    }

    const userId = user.id;
    const limits = await this.userSubscriptionsService.getUserLimits(userId);

    switch (featureType) {
      case 'theme_access':
        if (!limits.has_theme_access) {
          throw new ForbiddenException('Upgrade to Pro plan to access themes');
        }
        break;
      case 'custom_domain':
        if (!limits.has_custom_domain) {
          throw new ForbiddenException(
            'Upgrade to Pro plan to use custom domains',
          );
        }
        break;
      case 'branding_removal':
        // Not usually guarded by endpoint but by frontend/renderer check?
        break;
    }

    return true;
  }
}
