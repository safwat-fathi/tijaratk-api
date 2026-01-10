import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { CheckSlugDto } from './dto/check-slug.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import {
  CheckSlugResponseDto,
  StoreResponseDto,
  ThemeEditorSessionResponseDto,
} from './dto/store-response.dto';
import { StoreStatsResponseDto } from './dto/store-stats.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

/**
 * Stores Controller - Authenticated endpoints for store management.
 *
 * Route pattern: /stores (uses authenticated user's ID from JWT)
 *
 * The authenticated user must have a merchant profile to manage stores.
 */
@ApiTags('Stores')
@ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
@UseGuards(AuthGuard(CONSTANTS.AUTH.JWT))
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new store for the authenticated user',
    description:
      'Creates a new store for the currently authenticated user. A slug will be auto-generated from the store name if not provided.',
  })
  @ApiBody({ type: CreateStoreDto })
  @ApiCreatedResponse({
    description: 'The store has been successfully created',
    type: StoreResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async create(
    @Req() req: Request,
    @Body() dto: CreateStoreDto,
  ): Promise<StoreResponseDto> {
    const userId = (req.user as any).id;
    return this.storesService.createForOwner(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all stores for the authenticated user',
    description:
      'Retrieves all stores owned by the currently authenticated user, ordered by creation date (newest first).',
  })
  @ApiOkResponse({
    description: 'List of stores owned by the user',
    type: [StoreResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  findAll(@Req() req: Request): Promise<StoreResponseDto[]> {
    const userId = (req.user as any).id;
    return this.storesService.findByOwner(userId);
  }

  @Get('slug/check')
  @ApiOperation({
    summary: 'Check store slug availability',
    description:
      'Checks if a store slug is available for use. Optionally excludes a specific store ID from the check (useful when updating a store).',
  })
  @ApiOkResponse({
    description: 'Whether the slug is available',
    type: CheckSlugResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  async checkSlug(@Query() query: CheckSlugDto): Promise<CheckSlugResponseDto> {
    const { slug, excludeId } = query;
    const available = await this.storesService.isSlugAvailable(slug, excludeId);
    return { available };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific store by ID',
    description:
      'Retrieves detailed information about a specific store owned by the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Store details',
    type: StoreResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  findOne(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StoreResponseDto> {
    const userId = (req.user as any).id;
    return this.storesService.findOneForOwner(userId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update store by ID',
    description:
      'Updates an existing store owned by the authenticated user. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateStoreDto })
  @ApiOkResponse({
    description: 'The store has been successfully updated',
    type: StoreResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    const userId = (req.user as any).id;
    return this.storesService.updateForOwner(userId, id, dto);
  }

  @Post(':id/theme-editor-session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a scoped theme editor session',
    description:
      'Creates a signed JWT token for accessing the theme editor. The token is scoped to the specific store and has a limited validity period.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    example: 1,
    type: Number,
  })
  @ApiCreatedResponse({
    description: 'Theme editor token issued successfully',
    type: ThemeEditorSessionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  createThemeEditorSession(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ThemeEditorSessionResponseDto> {
    const userId = (req.user as any).id;
    return this.storesService.createThemeEditorSession(userId, id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get dashboard statistics for a store',
    description:
      'Retrieves counter statistics for the merchant dashboard, including store visits, orders, sales, and products count.',
  })
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Dashboard counter statistics',
    type: StoreStatsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid JWT required',
  })
  getStats(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StoreStatsResponseDto> {
    const userId = (req.user as any).id;
    return this.storesService.getStoreStats(id, userId);
  }
}
