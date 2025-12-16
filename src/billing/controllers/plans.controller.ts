import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PlansService } from '../services/plans.service';

@ApiTags('Billing')
@Controller('billing/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get('compare')
  compare(@Query('current') current: string, @Query('target') target: string) {
    return this.plansService.comparePlans(+current, +target);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(+id);
  }
}
