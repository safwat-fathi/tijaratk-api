import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  PlanResponseDto,
  PlanCompareResponseDto,
} from '../dto/billing-response.dto';
import { PlansService } from '../services/plans.service';

/**
 * Plans Controller - Public endpoints for viewing subscription plans.
 *
 * No authentication required - plans are publicly visible.
 */
@ApiTags('Billing - Plans')
@Controller('billing/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all available plans',
    description:
      'Retrieves all active subscription plans. Plans are ordered by display_order.',
  })
  @ApiOkResponse({
    description: 'List of available plans',
    type: [PlanResponseDto],
  })
  findAll() {
    return this.plansService.findAll();
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare two plans',
    description:
      'Compares features and pricing between two plans. Useful for upgrade/downgrade decisions.',
  })
  @ApiQuery({
    name: 'current',
    description: 'Current plan ID',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'target',
    description: 'Target plan ID',
    example: 2,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Plan comparison result',
    type: PlanCompareResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'One or both plans not found',
  })
  compare(
    @Query('current', ParseIntPipe) current: number,
    @Query('target', ParseIntPipe) target: number,
  ) {
    return this.plansService.comparePlans(current, target);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get plan by ID',
    description: 'Retrieves detailed information about a specific plan.',
  })
  @ApiParam({
    name: 'id',
    description: 'Plan ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Plan details',
    type: PlanResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Plan not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }
}
