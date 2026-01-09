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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import CONSTANTS from 'src/common/constants';

import { CheckSlugDto } from './dto/check-slug.dto';
import { CreateStoreDto } from './dto/create-store.dto';
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
  @ApiBody({ description: 'Create store', type: CreateStoreDto })
  @ApiOperation({ summary: 'Create a new store for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The store has been successfully created.',
  })
  async create(@Req() req: Request, @Body() dto: CreateStoreDto) {
    const userId = (req.user as any).id;
    return this.storesService.createForOwner(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of stores owned by the user.',
  })
  findAll(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.storesService.findByOwner(userId);
  }

  @Get('slug/check')
  @ApiOperation({ summary: 'Check store slug availability' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Whether the slug is available',
  })
  checkSlug(@Query() query: CheckSlugDto) {
    const { slug, excludeId } = query;
    return this.storesService.isSlugAvailable(slug, excludeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific store by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Store details.',
  })
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any).id;
    return this.storesService.findOneForOwner(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update store by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The store has been successfully updated.',
  })
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ) {
    const userId = (req.user as any).id;
    return this.storesService.updateForOwner(userId, id, dto);
  }

  @Post(':id/theme-editor-session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a scoped theme editor session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Theme editor token issued successfully.',
  })
  createThemeEditorSession(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = (req.user as any).id;
    return this.storesService.createThemeEditorSession(userId, id);
  }
}
