import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { PurchaseAddonDto } from '../dto/purchase-addon.dto';
import {
  AddonResponseDto,
  UserAddonResponseDto,
  AddonCancelResponseDto,
} from '../dto/billing-response.dto';
import { AddonsService } from '../services/addons.service';
import { BillingService } from '../services/billing.service';

/**
 * Addons Controller - Endpoints for managing add-on purchases.
 *
 * Addons extend plan limits (e.g., extra messages, staff seats).
 */
@ApiTags('Billing - Addons')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('billing/addons')
export class AddonsController {
  constructor(
    private readonly addonsService: AddonsService,
    private readonly billingService: BillingService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all available addons',
    description:
      'Retrieves all active addons available for purchase. Some addons may be restricted to specific plans.',
  })
  @ApiOkResponse({
    description: 'List of available addons',
    type: [AddonResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  findAll() {
    return this.addonsService.findAll();
  }

  @Get('my-addons')
  @ApiOperation({
    summary: 'Get user purchased addons',
    description:
      'Retrieves all addons purchased by the authenticated user, including their status and quantities.',
  })
  @ApiOkResponse({
    description: 'List of user addons',
    type: [UserAddonResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  getUserAddons(@Req() req: Request) {
    const userId = Number((req.user as any).id);
    return this.addonsService.getUserAddons(userId);
  }

  @Post('purchase')
  @ApiOperation({
    summary: 'Purchase an addon',
    description:
      "Purchases an addon for the authenticated user. The addon will be added to the user's account immediately.",
  })
  @ApiBody({ type: PurchaseAddonDto })
  @ApiCreatedResponse({
    description: 'Addon purchased successfully - returns updated user addons',
    type: [UserAddonResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Addon not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async purchase(@Req() req: Request, @Body() dto: PurchaseAddonDto) {
    const userId = Number((req.user as any).id);
    await this.billingService.handleAddonPurchase(userId, dto);
    return this.addonsService.getUserAddons(userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel an addon',
    description:
      'Cancels a purchased addon. The addon will remain active until the end of the current billing period.',
  })
  @ApiParam({
    name: 'id',
    description: 'User addon ID (not the addon product ID)',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Addon cancelled successfully',
    type: AddonCancelResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User addon not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  cancel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = Number((req.user as any).id);
    return this.addonsService.cancelAddon(userId, id);
  }
}

