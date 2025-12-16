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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { UpdateStorefrontThemeDto } from './dto/update-storefront-theme.dto';
import { ThemeEditorAuthGuard } from './guards/theme-editor.guard';
import { StorefrontsService } from './storefronts.service';

@ApiTags('Storefront Theme Editor')
@Controller('storefronts')
@UseGuards(ThemeEditorAuthGuard)
export class StorefrontThemeEditorController {
  constructor(private readonly storefrontsService: StorefrontsService) {}

  @Get(':slug/theme')
  @ApiOperation({ summary: 'Get storefront theme for theme editor' })
  @ApiResponse({ status: HttpStatus.OK })
  getTheme(@Param('slug') slug: string, @Req() req: Request) {
    const payload = (req as any).themeEditor;
    return this.storefrontsService.getStorefrontThemeBySlug(
      slug,
      payload?.storefrontId,
    );
  }

  @Patch(':slug/theme')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update storefront theme via theme editor' })
  @ApiResponse({ status: HttpStatus.OK })
  updateTheme(
    @Param('slug') slug: string,
    @Body() dto: UpdateStorefrontThemeDto,
    @Req() req: Request,
  ) {
    const payload = (req as any).themeEditor;
    return this.storefrontsService.updateStorefrontThemeBySlug(
      slug,
      dto.theme,
      payload?.storefrontId,
    );
  }
}
