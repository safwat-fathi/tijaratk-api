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

import { UpdateStoreThemeDto } from './dto/update-store-theme.dto';
import { StoreThemeEditorAuthGuard } from './guards/store-theme-editor.guard';
import { StoresService } from './stores.service';

@ApiTags('Store Theme Editor')
@Controller('stores')
@UseGuards(StoreThemeEditorAuthGuard)
export class StoreThemeEditorController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':slug/theme')
  @ApiOperation({ summary: 'Get store theme for theme editor' })
  @ApiResponse({ status: HttpStatus.OK, })
  getTheme(@Param('slug') slug: string, @Req() req: Request) {
    const payload = (req as any).themeEditor;
    return this.storesService.getStoreThemeBySlug(slug, payload?.storeId);
  }

  @Patch(':slug/theme')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update store theme via theme editor' })
  @ApiResponse({ status: HttpStatus.OK })
  updateTheme(
    @Param('slug') slug: string,
    @Body() dto: UpdateStoreThemeDto,
    @Req() req: Request,
  ) {
    const payload = (req as any).themeEditor;
    return this.storesService.updateStoreThemeBySlug(
      slug,
      dto.theme,
      payload?.storeId,
    );
  }
}
