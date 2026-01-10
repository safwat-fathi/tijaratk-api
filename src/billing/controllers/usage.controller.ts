import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { UsageStatsResponseDto } from '../dto/billing-response.dto';
import { UsageTrackingService } from '../services/usage-tracking.service';

/**
 * Usage Controller - Authenticated endpoints for viewing usage statistics.
 *
 * Provides current usage vs plan limits for the authenticated user.
 */
@ApiTags('Billing - Usage')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('billing/usage')
export class UsageController {
  constructor(private readonly usageTrackingService: UsageTrackingService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current usage statistics',
    description:
      'Retrieves the current usage statistics for the authenticated user, including products, posts, messages, and staff counts compared to plan limits.',
  })
  @ApiOkResponse({
    description: 'Usage statistics',
    type: UsageStatsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  getStats(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.usageTrackingService.getUserUsageStats(userId);
  }
}

