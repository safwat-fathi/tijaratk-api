import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersPublicController } from './orders-public.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Storefront])],
  controllers: [OrdersPublicController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

