import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateCustomOrderDto } from './dto/custom-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomOrdersService } from './custom-orders.service';
import { OrdersService } from './orders.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '../stores/entities/store.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Public Store Orders')
@Controller('public')
export class OrdersPublicController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly customOrdersService: CustomOrdersService,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  @Post('stores/:slug/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    description: 'Create an order for a store',
    type: CreateOrderDto,
  })
  @ApiOperation({ summary: 'Create store order (public, no auth)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The order has been successfully created.',
  })
  createOrder(@Param('slug') slug: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromPublic(slug, dto);
  }

  @Post('stores/:slug/custom-orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    description: 'Create a custom order request for a store',
    type: CreateCustomOrderDto,
  })
  @ApiOperation({ summary: 'Create custom order request (public, no auth)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The custom order request has been successfully created.',
  })
  async createCustomRequest(
    @Param('slug') slug: string,
    @Body() dto: CreateCustomOrderDto,
  ) {
    const store = await this.storeRepo.findOne({ where: { slug } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return this.customOrdersService.create(store.id, dto);
  }
}
