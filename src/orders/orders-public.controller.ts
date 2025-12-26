import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { CreateCustomOrderDto } from './dto/custom-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomOrdersService } from './custom-orders.service';
import { OrdersService } from './orders.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Storefront } from '../storefronts/entities/storefront.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Public Storefront Orders')
@Controller('public')
@UseGuards(ThrottlerGuard)
export class OrdersPublicController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly customOrdersService: CustomOrdersService,
    @InjectRepository(Storefront)
    private readonly storefrontRepo: Repository<Storefront>,
  ) {}

  @Post('storefronts/:slug/orders')
  @Throttle({ default: { limit: 5, ttl: 60 * 15 } }) // max 5 orders per 10 minutes per IP
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

  @Post('storefronts/:slug/custom-orders')
  @Throttle({ default: { limit: 5, ttl: 60 * 15 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    description: 'Create a custom order request for a storefront',
    type: CreateCustomOrderDto,
  })
  @ApiOperation({ summary: 'Create custom order request (public)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The custom request has been successfully created.',
  })
  async createCustomRequest(
    @Param('slug') slug: string,
    @Body() dto: CreateCustomOrderDto,
  ) {
    const storefront = await this.storefrontRepo.findOne({ where: { slug } });
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }
    return this.customOrdersService.create(storefront.id, dto);
  }

  @Get('orders/:orderId')
  @Throttle({ default: { limit: 20, ttl: 60 * 5 } })
  @ApiOperation({ summary: 'Get public order details by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order details' })
  getPublicOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.ordersService.getPublicOrder(orderId);
  }
}
