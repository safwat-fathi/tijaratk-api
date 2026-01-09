import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Product } from 'src/products/entities/product.entity';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminStoresController } from './controllers/admin-stores.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminStoresService } from './services/admin-stores.service';
import { AdminProductsService } from './services/admin-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Product])],
  controllers: [
    AdminUsersController,
    AdminStoresController,
    AdminProductsController,
  ],
  providers: [AdminUsersService, AdminStoresService, AdminProductsService],
})
export class AdminModule {}
