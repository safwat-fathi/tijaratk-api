import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Public Storefront Orders')
@Controller('public/storefronts')
@UseGuards(ThrottlerGuard)
export class OrdersPublicController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':slug/orders')
  @Throttle({ default: { limit: 5, ttl: 600 } }) // max 5 orders per 10 minutes per IP
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    description: 'Create an order for a storefront',
    type: CreateOrderDto,
  })
  @ApiOperation({ summary: 'Create storefront order (public, no auth)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The order has been successfully created.',
  })
  createOrder(@Param('slug') slug: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createForStorefront(slug, dto);
  }
}
