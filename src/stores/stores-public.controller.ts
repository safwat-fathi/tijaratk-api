import { Request } from 'express';
import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
  Body,
  Req,
} from '@nestjs/common';
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
  PublicStoreCategoryDto,
  PublicStoreResponseDto,
  PublicStoreSeoDto,
  PublicStoreThemeDto,
} from './dto/store-public-response.dto';
import { TrackVisitDto } from './dto/track-visit.dto';
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

  @Get(':slug/theme')
  @ApiOperation({
    summary: 'Get public store theme',
    description: 'Retrieves store theme configuration (cached for 1 hour).',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug',
    type: String,
  })
  @ApiOkResponse({
    description: 'Store theme configuration',
    type: PublicStoreThemeDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found or is closed',
  })
  async getStoreTheme(
    @Param('slug') slug: string,
  ): Promise<PublicStoreThemeDto> {
    const config = await this.storesService.getPublicStoreTheme(slug);
    return { config };
  }

  @Get(':slug/seo')
  @ApiOperation({
    summary: 'Get public store SEO',
    description: 'Retrieves store SEO configuration.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug',
    type: String,
  })
  @ApiOkResponse({
    description: 'Store SEO configuration',
    type: PublicStoreSeoDto,
  })
  async getStoreSeo(@Param('slug') slug: string): Promise<PublicStoreSeoDto> {
    return this.storesService.getPublicStoreSeo(slug);
  }

  @Get(':slug/categories')
  @ApiOperation({
    summary: 'Get public store categories',
    description: 'Retrieves store category information.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug',
    type: String,
  })
  @ApiOkResponse({
    description: 'Store category information',
    type: PublicStoreCategoryDto,
  })
  async getStoreCategories(
    @Param('slug') slug: string,
  ): Promise<PublicStoreCategoryDto> {
    return this.storesService.getPublicStoreCategories(slug);
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

  @Post(':id/visit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a store visit',
    description:
      'Records a page visit for analytics. Called by the storefront when a user visits the store page.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store id (URL-friendly identifier)',
    example: 1,
    type: Number,
  })
  async recordVisit(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() dto: TrackVisitDto,
    @Ip() requestIp: string,
    @Headers('user-agent') requestUserAgent?: string,
    @Headers('referer') requestReferer?: string,
    @Query('source') querySource?: string,
    @Query('utm_source') queryUtmSource?: string,
  ): Promise<void> {
    const sessionId = req.sessionId;

    await this.storesService.recordStoreVisit(id, {
      ip: dto.ip || requestIp,
      userAgent: dto.userAgent || requestUserAgent,
      referer: dto.referer || requestReferer,
      source: dto.source || querySource,
      utmSource: dto.utmSource || queryUtmSource,
      sessionId,
    });
  }
}
