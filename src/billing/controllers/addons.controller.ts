import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CONSTANTS from 'src/common/constants';
import { AddonsService } from '../services/addons.service';
import { BillingService } from '../services/billing.service';
import { PurchaseAddonDto } from '../dto/purchase-addon.dto';

@ApiTags('Billing')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('billing/addons')
export class AddonsController {
  constructor(
    private readonly addonsService: AddonsService,
    private readonly billingService: BillingService,
  ) {}

  @Get()
  findAll() {
    return this.addonsService.findAll();
  }

  @Get('my-addons')
  getUserAddons(@Req() req) {
    const userId = Number(req.user.id);
    return this.addonsService.getUserAddons(userId);
  }

  @Post('purchase')
  async purchase(@Req() req, @Body() dto: PurchaseAddonDto) {
    const userId = Number(req.user.id);
    await this.billingService.handleAddonPurchase(userId, dto);
    return this.addonsService.getUserAddons(userId);
  }

  @Delete(':id')
  cancel(@Req() req, @Param('id') id: string) {
    const userId = Number(req.user.id);
    return this.addonsService.cancelAddon(userId, +id);
  }
}
