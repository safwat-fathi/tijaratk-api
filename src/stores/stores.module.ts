import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheService } from '../common/cache.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Store } from './entities/store.entity';
import { StoreTheme } from './entities/store-theme.entity';
import { StoreVisit } from './entities/store-visit.entity';
import { StoreThemeEditorAuthGuard } from './guards/store-theme-editor.guard';
import { StoreThemeEditorController } from './store-theme-editor.controller';
import { StoreThemeEditorTokenService } from './store-theme-editor-token.service';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { StoresPublicController } from './stores-public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreTheme, StoreVisit, Order, Product]),
  ],
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
