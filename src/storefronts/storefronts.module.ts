import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

import { Storefront } from './entities/storefront.entity';
import { StorefrontCategory } from './entities/storefront-category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { ThemeEditorAuthGuard } from './guards/theme-editor.guard';
import { StorefrontThemeEditorController } from './storefront-theme-editor.controller';
import { StorefrontsController } from './storefronts.controller';
import { StorefrontsService } from './storefronts.service';
import { StorefrontsPublicController } from './storefronts-public.controller';
import { ThemeEditorTokenService } from './theme-editor-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Storefront,
      User,
      Product,
      StorefrontCategory,
      SubCategory,
      Category,
    ]),
  ],
  controllers: [
    StorefrontsController,
    StorefrontsPublicController,
    StorefrontThemeEditorController,
  ],
  providers: [
    StorefrontsService,
    ThemeEditorTokenService,
    ThemeEditorAuthGuard,
  ],
  exports: [StorefrontsService],
})
export class StorefrontsModule {}
