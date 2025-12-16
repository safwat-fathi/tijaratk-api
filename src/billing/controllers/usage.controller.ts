import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';

import { UsageTrackingService } from '../services/usage-tracking.service';

@ApiTags('Billing')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('billing/usage')
export class UsageController {
  constructor(private readonly usageTrackingService: UsageTrackingService) {}

  @Get()
  getStats(@Req() req) {
    const userId = Number(req.user.id);
    return this.usageTrackingService.getUserUsageStats(userId);
  }
}
