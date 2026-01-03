import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersPublicController } from './orders-public.controller';
import { CustomOrderRequest } from './entities/custom-order-request.entity';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrdersController } from './custom-orders.controller';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Storefront,
      CustomOrderRequest,
    ]),
  ],
  controllers: [
    OrdersController,
    OrdersPublicController,
    CustomOrdersController,
  ],
  providers: [OrdersService, CustomOrdersService],
  exports: [OrdersService, CustomOrdersService],
})
export class OrdersModule {}
