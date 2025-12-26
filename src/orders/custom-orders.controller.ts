import { Controller, Post, Get, Param, Body, Patch, UseGuards, Query } from '@nestjs/common';
import { CustomOrdersService } from './custom-orders.service';
import { CreateCustomOrderDto, QuoteCustomOrderDto } from './dto/custom-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Storefront } from '../storefronts/entities/storefront.entity';
import { Repository } from 'typeorm';
import { NotFoundException, Req } from '@nestjs/common';

import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

@Controller()
export class CustomOrdersController {
  constructor(
    private readonly customOrdersService: CustomOrdersService,
    @InjectRepository(Storefront)
    private readonly storefrontRepo: Repository<Storefront>,
  ) {}

  // Public Endpoints

  // Public Endpoints
  // Moved to OrdersPublicController
  
  // Actually, let's inject StorefrontsService properly to make this work.
  // ...
  
  // Seller Endpoints (Authenticated)
  
  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Get('storefronts/:storefrontId/custom-orders')
  async findAll(
    @Param('storefrontId') storefrontId: number,
    @Req() req: Request,
  ) {
      const { facebookId } = req.user as any; // Cast as any or define type
      const storefront = await this.storefrontRepo.findOne({ 
          where: { id: storefrontId },
          relations: ['user'] 
      });
      
      if (!storefront || storefront.user.facebookId !== facebookId) {
          throw new NotFoundException('Storefront not found');
      }

      return this.customOrdersService.findAllForStorefront(storefrontId);
  }

  @UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
  @Patch('storefronts/:storefrontId/custom-orders/:id/quote')
  async quoteReference(
      @Param('storefrontId') storefrontId: number,
      @Param('id') id: number,
      @Body() dto: QuoteCustomOrderDto,
      @Req() req: Request,
  ) {
      const { facebookId } = req.user as any;
      const storefront = await this.storefrontRepo.findOne({ 
          where: { id: storefrontId },
          relations: ['user'] 
      });
      
      if (!storefront || storefront.user.facebookId !== facebookId) {
          throw new NotFoundException('Storefront not found');
      }

      return this.customOrdersService.quote(id, storefrontId, dto);
  }
}
