import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ListStorefrontProductsDto } from './dto/list-storefront-products.dto';
import { StorefrontsService } from './storefronts.service';

@ApiTags('Public Storefronts')
@Controller('public/storefronts')
export class StorefrontsPublicController {
  constructor(private readonly storefrontsService: StorefrontsService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get public storefront by slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Public storefront data by slug',
  })
  getStorefront(@Param('slug') slug: string) {
    return this.storefrontsService.getPublicStorefront(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get products for a public storefront' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of products for a storefront',
  })
  getStorefrontProducts(
    @Param('slug') slug: string,
    @Query() query: ListStorefrontProductsDto,
  ) {
    return this.storefrontsService.getPublicStorefrontProducts(slug, query);
  }

  @Get(':slug/products/:productSlug')
  @ApiOperation({ summary: 'Get a single product for a public storefront' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Single product details for a storefront',
  })
  getStorefrontProduct(
    @Param('slug') slug: string,
    @Param('productSlug') productSlug: string,
  ) {
    return this.storefrontsService.getPublicStorefrontProduct(
      slug,
      productSlug,
    );
  }
}
