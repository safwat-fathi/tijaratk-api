import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ListStoreProductsDto } from './dto/list-store-products.dto';
import {
  PublicProductListResponseDto,
  PublicProductResponseDto,
  PublicStoreResponseDto,
} from './dto/store-public-response.dto';
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
  @ApiOperation({
    summary: 'Get public store by slug',
    description:
      'Retrieves public store information for storefront display. Only returns open stores.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug (URL-friendly identifier)',
    example: 'fashion-store',
    type: String,
  })
  @ApiOkResponse({
    description: 'Public store data',
    type: PublicStoreResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found or is closed',
  })
  getStore(@Param('slug') slug: string): Promise<PublicStoreResponseDto> {
    return this.storesService.getPublicStore(slug);
  }

  @Get(':slug/products')
  @ApiOperation({
    summary: 'Get products for a public store',
    description:
      'Retrieves a paginated list of active products for a public store. Supports keyword search.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug (URL-friendly identifier)',
    example: 'fashion-store',
    type: String,
  })
  @ApiOkResponse({
    description: 'Paginated list of products',
    type: PublicProductListResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found or is closed',
  })
  getStoreProducts(
    @Param('slug') slug: string,
    @Query() query: ListStoreProductsDto,
  ) {
    return this.storesService.getPublicStoreProducts(slug, query);
  }

  @Get(':slug/products/:productSlug')
  @ApiOperation({
    summary: 'Get a single product for a public store',
    description:
      'Retrieves detailed information about a specific product in a public store, including variants.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug (URL-friendly identifier)',
    example: 'fashion-store',
    type: String,
  })
  @ApiParam({
    name: 'productSlug',
    description: 'Product slug (URL-friendly identifier)',
    example: 'cotton-shirt',
    type: String,
  })
  @ApiOkResponse({
    description: 'Product details with variants',
    type: PublicProductResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store or product not found',
  })
  getStoreProduct(
    @Param('slug') slug: string,
    @Param('productSlug') productSlug: string,
  ) {
    return this.storesService.getPublicStoreProduct(slug, productSlug);
  }
}
