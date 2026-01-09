import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersPublicController } from './orders-public.controller';
import { CustomOrderRequest } from './entities/custom-order-request.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { OrderLink } from './entities/order-link.entity';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrdersController } from './custom-orders.controller';

@Module({
  imports: [
    NotificationsModule,
    WhatsappModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Store,
      Customer,
      CustomOrderRequest,
      ProductVariant,
      OrderLink,
    ]),
  ],
  controllers: [
    // OrdersController,
    OrdersPublicController,
    // CustomOrdersController,
  ],
  providers: [OrdersService, CustomOrdersService],
  exports: [OrdersService, CustomOrdersService],
})
export class OrdersModule {}
