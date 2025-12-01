import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/products/entities/product.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import { In, Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Storefront)
    private readonly storefrontRepo: Repository<Storefront>,
  ) {}

  async createForStorefront(slug: string, dto: CreateOrderDto) {
    const storefront = await this.storefrontRepo.findOne({
      where: { slug, is_published: true },
      relations: { user: true },
    });
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }

    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Load and validate all products in one go
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepo.findBy({
      id: In(productIds),
      user: { id: storefront.user.id },
      status: ProductStatus.ACTIVE,
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const itemDto of dto.items) {
      const product = products.find((p) => p.id === itemDto.productId);
      if (!product) {
        throw new BadRequestException(`Invalid product: ${itemDto.productId}`);
      }

      if (itemDto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero');
      }

      const unitPrice = product.price;
      const totalPrice = unitPrice * itemDto.quantity;
      totalAmount += totalPrice;

      const orderItem = this.orderItemRepo.create({
        product,
        quantity: itemDto.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepo.create({
      ...dto,
      status: OrderStatus.PENDING,
      storefront,
      total_amount: totalAmount,
      items: orderItems,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Do not leak internal relations
    delete savedOrder.storefront;

    return savedOrder;
  }
}
