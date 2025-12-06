import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

import { Storefront } from './entities/storefront.entity';
import { StorefrontsController } from './storefronts.controller';
import { StorefrontsPublicController } from './storefronts-public.controller';
import { StorefrontsService } from './storefronts.service';
import { StorefrontThemeEditorController } from './storefront-theme-editor.controller';
import { ThemeEditorTokenService } from './theme-editor-token.service';
import { ThemeEditorAuthGuard } from './guards/theme-editor.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Storefront, User, Product])],
  controllers: [
    StorefrontsController,
    StorefrontsPublicController,
    StorefrontThemeEditorController,
  ],
  providers: [StorefrontsService, ThemeEditorTokenService, ThemeEditorAuthGuard],
  exports: [StorefrontsService],
})
export class StorefrontsModule {}
