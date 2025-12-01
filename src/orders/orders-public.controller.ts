import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Public Storefront Orders')
@Controller('public/storefronts')
export class OrdersPublicController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':slug/orders')
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

