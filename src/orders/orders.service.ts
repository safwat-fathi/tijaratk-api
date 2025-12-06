import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/products/entities/product.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import {
  Between,
  FindOptionsWhere,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
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

  private async ensureStorefrontOwnership(
    facebookId: string,
    storefrontId: number,
  ) {
    const storefront = await this.storefrontRepo.findOne({
      where: { id: storefrontId },
      relations: { user: true },
    });
    if (!storefront) {
      throw new NotFoundException('Storefront not found');
    }
    if (storefront.user.facebookId !== facebookId) {
      throw new NotFoundException('Storefront not found');
    }

    return storefront;
  }

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

      const MAX_QTY_PER_ITEM = 10;
      if (itemDto.quantity <= 0 || itemDto.quantity > MAX_QTY_PER_ITEM) {
        throw new BadRequestException(
          `Quantity must be between 1 and ${MAX_QTY_PER_ITEM}`,
        );
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

    const MIN_TOTAL_AMOUNT = 1; // Adjust as needed
    const MAX_ITEMS = 20;

    if (dto.items.length > MAX_ITEMS) {
      throw new BadRequestException('Too many items in order');
    }

    const order = this.orderRepo.create({
      ...dto,
      status: OrderStatus.PENDING,
      storefront,
      total_amount: totalAmount,
      items: orderItems,
    });

    if (totalAmount < MIN_TOTAL_AMOUNT) {
      throw new BadRequestException('Order total is too low');
    }

    // Basic per-phone recent orders check (last 10 minutes)
    const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);
    const recentOrdersCount = await this.orderRepo.count({
      where: {
        storefront: { id: storefront.id },
        buyer_phone: dto.buyer_phone,
        created_at: MoreThanOrEqual(TEN_MINUTES_AGO),
      },
    });

    if (recentOrdersCount >= 5) {
      throw new BadRequestException(
        'Too many recent orders from this phone number',
      );
    }

    const savedOrder = await this.orderRepo.save(order);

    // Do not leak internal relations
    delete savedOrder.storefront;

    return savedOrder;
  }

  async getPublicOrder(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: {
        items: { product: true },
        storefront: true,
      },
    });

    if (!order || !order.storefront?.is_published) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      status: order.status,
      buyer_name: order.buyer_name,
      buyer_phone: order.buyer_phone,
      buyer_email: order.buyer_email,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_postal_code: order.shipping_postal_code,
      total_amount: order.total_amount,
      created_at: order.created_at,
      storefront: {
        id: order.storefront.id,
        name: order.storefront.name,
        slug: order.storefront.slug,
      },
      items:
        order.items?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          total_price: item.total_price,
          unit_price: item.unit_price,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
              }
            : undefined,
        })) ?? [],
    };
  }

  async findForStorefrontOwner(
    facebookId: string,
    storefrontId: number,
    query: ListOrdersDto,
  ) {
    const storefront = await this.ensureStorefrontOwnership(
      facebookId,
      storefrontId,
    );

    const {
      page = 1,
      limit = 10,
      status,
      buyer_name,
      buyer_email,
      buyer_phone,
      created_from,
      created_to,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order> = {
      storefront: { id: storefront.id },
    };

    if (status) {
      where.status = status;
    }
    if (buyer_name) {
      where.buyer_name = buyer_name;
    }
    if (buyer_email) {
      where.buyer_email = buyer_email;
    }
    if (buyer_phone) {
      where.buyer_phone = buyer_phone;
    }
    if (created_from && created_to) {
      where.created_at = Between(created_from, created_to);
    } else if (created_from) {
      where.created_at = MoreThanOrEqual(created_from);
    } else if (created_to) {
      where.created_at = Between(new Date(0), created_to);
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: { items: { product: true } },
      skip,
      take: limit,
      order: {
        [sort_by]: sort_order,
      },
    });

    return {
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
      items,
    };
  }

  async findOneForStorefrontOwner(
    facebookId: string,
    storefrontId: number,
    orderId: number,
  ) {
    await this.ensureStorefrontOwnership(facebookId, storefrontId);

    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        storefront: { id: storefrontId },
      },
      relations: { items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatusForStorefrontOwner(
    facebookId: string,
    storefrontId: number,
    orderId: number,
    status: OrderStatus,
  ) {
    await this.ensureStorefrontOwnership(facebookId, storefrontId);

    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        storefront: { id: storefrontId },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;

    return this.orderRepo.save(order);
  }
}
