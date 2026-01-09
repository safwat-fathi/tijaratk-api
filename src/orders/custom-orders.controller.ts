import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CustomOrdersService } from './custom-orders.service';
import {
  CreateCustomOrderDto,
  QuoteCustomOrderDto,
} from './dto/custom-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from '../stores/entities/store.entity';
import { Repository } from 'typeorm';

import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

/**
 * Custom Orders Controller
 *
 * NOTE: This controller is currently disabled in orders.module.ts (commented out in controllers array)
 *
 * TODO: Enable this controller once User-Merchant relationship is established.
 * The authorization pattern needs to verify that the authenticated user
 * has permission to manage the store's custom orders (via merchant ownership).
 */
@Controller()
export class CustomOrdersController {
  constructor(
    private readonly customOrdersService: CustomOrdersService,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  // Seller Endpoints (Authenticated)
  // TODO: Add proper merchant ownership verification when User-Merchant relation is established

  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('stores/:storeId/custom-orders')
  async findAll(@Param('storeId') storeId: number, @Req() req: Request) {
    const store = await this.storeRepo.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // TODO: Add merchant ownership check
    // if (store.merchant_id !== req.user.merchant_id) {
    //   throw new ForbiddenException('Not authorized to access this store');
    // }

    return this.customOrdersService.findAllForStore(storeId);
  }

  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('stores/:storeId/custom-orders/:id')
  async findOne(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Req() req: Request,
  ) {
    const store = await this.storeRepo.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // TODO: Add merchant ownership check

    const request = await this.customOrdersService.findOne(id);

    if (request.store_id !== Number(storeId)) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Patch('stores/:storeId/custom-orders/:id/quote')
  async quoteRequest(
    @Param('storeId') storeId: number,
    @Param('id') id: number,
    @Body() dto: QuoteCustomOrderDto,
    @Req() req: Request,
  ) {
    const store = await this.storeRepo.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // TODO: Add merchant ownership check

    return this.customOrdersService.quote(id, storeId, dto);
  }
}
