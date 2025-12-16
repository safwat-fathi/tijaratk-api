import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BillingModule } from '../billing/billing.module';

import { ImageProcessorService } from 'src/common/services/image-processor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User]), BillingModule],
  controllers: [ProductsController],
  providers: [ProductsService, ImageProcessorService],
  exports: [ProductsService],
})
export class ProductsModule {};
