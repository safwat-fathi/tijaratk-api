import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageProcessorService } from 'src/common/services/image-processor.service';

import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
  ProductsController,
  ProductsUploadController,
} from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant])],
  controllers: [ProductsController, ProductsUploadController],
  providers: [ProductsService, ImageProcessorService],
  exports: [ProductsService],
})
export class ProductsModule {}
