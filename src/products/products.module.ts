import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageProcessorService } from 'src/common/services/image-processor.service';
import { User } from 'src/users/entities/user.entity';

import { BillingModule } from '../billing/billing.module';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User]), BillingModule],
  controllers: [ProductsController],
  providers: [ProductsService, ImageProcessorService],
  exports: [ProductsService],
})
export class ProductsModule {}
