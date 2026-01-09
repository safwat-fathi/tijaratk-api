import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ListStoreProductsDto } from './dto/list-store-products.dto';
import { StoresService } from './stores.service';

/**
 * Stores Public Controller - Public (unauthenticated) endpoints for storefront access.
 *
 * Route pattern: /public/stores/:slug
 */
@ApiTags('Public Stores')
@Controller('public/stores')
export class StoresPublicController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get public store by slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Public store data by slug',
  })
  getStore(@Param('slug') slug: string) {
    return this.storesService.getPublicStore(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get products for a public store' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of products for a store',
  })
  getStoreProducts(
    @Param('slug') slug: string,
    @Query() query: ListStoreProductsDto,
  ) {
    return this.storesService.getPublicStoreProducts(slug, query);
  }

  @Get(':slug/products/:productSlug')
  @ApiOperation({ summary: 'Get a single product for a public store' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Single product details for a store',
  })
  getStoreProduct(
    @Param('slug') slug: string,
    @Param('productSlug') productSlug: string,
  ) {
    return this.storesService.getPublicStoreProduct(slug, productSlug);
  }
}
