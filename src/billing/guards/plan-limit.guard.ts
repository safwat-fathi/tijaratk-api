import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsageTrackingService } from '../services/usage-tracking.service';
import { LIMIT_KEY, LimitType } from './limit.decorator';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  private readonly logger = new Logger(PlanLimitGuard.name);

  constructor(
    private reflector: Reflector,
    private usageTrackingService: UsageTrackingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitType = this.reflector.getAllAndOverride<LimitType>(LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!limitType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      this.logger.warn('PlanLimitGuard active but no user found in request');
      return true; // Or false if strict? Assuming AuthGuard runs first.
    }

    // Ensure user.id is number
    const userId = user.id;

    try {
      switch (limitType) {
        case 'product':
          await this.usageTrackingService.checkProductLimit(userId);
          break;
        case 'post':
          await this.usageTrackingService.checkPostLimit(userId);
          break;
        case 'message':
          await this.usageTrackingService.checkMessageLimit(userId);
          break;
        case 'staff':
          // await this.usageTrackingService.checkStaffLimit(userId);
          // Staff limit logic not fully implemented yet in usage service
          break;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
