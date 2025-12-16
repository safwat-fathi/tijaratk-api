import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { UserSubscriptionsService } from '../services/user-subscriptions.service';
import { UpgradeSubscriptionDto } from '../dto/upgrade-subscription.dto';
import { DowngradeSubscriptionDto } from '../dto/downgrade-subscription.dto';
import CONSTANTS from 'src/common/constants';

@ApiTags('Billing')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('billing/subscription')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
    private readonly billingService: BillingService,
  ) {}

  @Get()
  async getSubscription(@Req() req) {
    const userId = Number(req.user.id);
    const subscription = await this.userSubscriptionsService.getUserSubscription(userId);
    const limits = await this.userSubscriptionsService.getUserLimits(userId);
    return { ...subscription, limits };
  }

  @Post('upgrade')
  async upgrade(@Req() req, @Body() dto: UpgradeSubscriptionDto) {
    const userId = Number(req.user.id);
    await this.billingService.handleUpgrade(userId, dto.planId);
    return this.userSubscriptionsService.getUserSubscription(userId);
  }

  @Post('downgrade')
  async downgrade(@Req() req, @Body() dto: DowngradeSubscriptionDto) {
    const userId = Number(req.user.id);
    await this.billingService.handleDowngrade(userId, dto.planId);
    return this.userSubscriptionsService.getUserSubscription(userId);
  }

  @Delete('cancel')
  async cancel(@Req() req) {
    const userId = Number(req.user.id);
    return this.userSubscriptionsService.cancelSubscription(userId);
  }

  @Post('reactivate')
  async reactivate(@Req() req) {
    const userId = Number(req.user.id);
    return this.userSubscriptionsService.reactivateSubscription(userId);
  }
}
