import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { UpdateStoreThemeDto } from './dto/update-store-theme.dto';
import { StoreThemeConfigResponseDto } from './dto/store-theme-response.dto';
import { StoreThemeEditorAuthGuard } from './guards/store-theme-editor.guard';
import { StoresService } from './stores.service';

/**
 * Store Theme Editor Controller - Endpoints for theme customization.
 *
 * These endpoints require a valid theme editor token (scoped JWT).
 * Tokens are obtained via POST /stores/:id/theme-editor-session.
 */
@ApiTags('Store Theme Editor')
@ApiBearerAuth('theme-editor-token')
@Controller('stores')
@UseGuards(StoreThemeEditorAuthGuard)
export class StoreThemeEditorController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':slug/theme')
  @ApiOperation({
    summary: 'Get store theme for theme editor',
    description:
      'Retrieves the current theme configuration for a store. Returns the merged configuration with default values.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug (URL-friendly identifier)',
    example: 'fashion-store',
    type: String,
  })
  @ApiOkResponse({
    description: 'Current theme configuration',
    type: StoreThemeConfigResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing theme editor token',
  })
  @ApiForbiddenResponse({
    description: 'Token does not match requested store',
  })
  getTheme(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<StoreThemeConfigResponseDto> {
    const payload = (req as any).themeEditor;
    return this.storesService.getStoreThemeBySlug(slug, payload?.storeId);
  }

  @Patch(':slug/theme')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update store theme via theme editor',
    description:
      'Updates the theme configuration for a store. Partial updates are supported - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Store slug (URL-friendly identifier)',
    example: 'fashion-store',
    type: String,
  })
  @ApiBody({ type: UpdateStoreThemeDto })
  @ApiOkResponse({
    description: 'Updated theme configuration',
    type: StoreThemeConfigResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Store not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing theme editor token',
  })
  @ApiForbiddenResponse({
    description: 'Token does not match requested store',
  })
  updateTheme(
    @Param('slug') slug: string,
    @Body() dto: UpdateStoreThemeDto,
    @Req() req: Request,
  ): Promise<StoreThemeConfigResponseDto> {
    const payload = (req as any).themeEditor;
    return this.storesService.updateStoreThemeBySlug(
      slug,
      dto.theme,
      payload?.storeId,
    );
  }
}

