import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/cache.service';
import { Store } from './entities/store.entity';
import { StoreTheme } from './entities/store-theme.entity';
import { StoreThemeEditorAuthGuard } from './guards/store-theme-editor.guard';
import { StoreThemeEditorController } from './store-theme-editor.controller';
import { StoreThemeEditorTokenService } from './store-theme-editor-token.service';
import { StoresController } from './stores.controller';
import { StoresPublicController } from './stores-public.controller';
import { StoresService } from './stores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreTheme])],
  controllers: [
    StoresController,
    StoresPublicController,
    StoreThemeEditorController,
  ],
  providers: [
    StoresService,
    StoreThemeEditorTokenService,
    StoreThemeEditorAuthGuard,
    CacheService,
  ],
  exports: [StoresService, StoreThemeEditorTokenService],
})
export class StoresModule {}
