import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customers/entities/customer.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { Product } from 'src/products/entities/product.entity';
import { Store } from 'src/stores/entities/store.entity';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  Between,
  Like,
  MoreThanOrEqual,
  LessThanOrEqual,
  Repository,
  In,
} from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderLink } from './entities/order-link.entity';
import {
  Order,
  OrderSource,
  OrderStatus,
  PaymentStatus,
} from './entities/order.entity';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { UpdateOrderNotesDto } from './dto/update-order-notes.dto';
import { SortOrder } from 'src/common/enums/sort.enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(OrderLink)
    private readonly orderLinkRepo: Repository<OrderLink>,
    private readonly whatsappService: WhatsappService,
  ) {}

  async createFromPublic(storeSlug: string, dto: any) {
    // dto: CustomCreateOrderDto not yet defined, using any for now or adapting
    // 1. Find Store
    const store = await this.storeRepo.findOne({
      where: { slug: storeSlug },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 2. Resolve Customer (Guest)
    let customer: Customer = null;
    if (dto.whatsapp_number) {
      // Normalize phone number if needed
      const phone = dto.whatsapp_number.replace(/\D/g, '');
      customer = await this.customerRepo.findOne({
        where: { whatsapp_number: phone }, // Exact match? Or clean?
      });

      if (!customer) {
        customer = this.customerRepo.create({
          name: dto.buyer_name, // Optional name for guest
          whatsapp_number: phone,
        });
        await this.customerRepo.save(customer);
      } else {
        // Update name if provided and previously null?
        if (dto.buyer_name && !customer.name) {
          customer.name = dto.buyer_name;
          await this.customerRepo.save(customer);
        }
      }
    }

    // 3. Process Items & Calculate Totals
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const itemDto of dto.items) {
      // Expect itemDto to have { product_id, variant_id, quantity }
      // OR just variant_id? Plan says: input items array of variant_id + quantity.
      // But we should support product_id too if no variant? Pivot says explicitly variants.
      // Let's assume input has variant_id.

      let variant: ProductVariant = null;
      let product: Product = null;

      if (itemDto.variant_id) {
        variant = await this.variantRepo.findOne({
          where: { id: itemDto.variant_id },
          relations: { product: true },
        });
        if (!variant)
          throw new BadRequestException(
            `Variant not found: ${itemDto.variant_id}`,
          );
        product = variant.product;
      } else if (itemDto.product_id) {
        // Fallback if we allowed adding product without explicit variant (should grab default?)
        // For Strict Variance, we should demand variant_id.
        // But let's support robust finding.
        product = await this.productRepo.findOne({
          where: { id: itemDto.product_id },
          relations: { variants: true },
        });
        if (!product)
          throw new BadRequestException(
            `Product not found: ${itemDto.product_id}`,
          );
        // Use default variant?
        variant = product.variants.find((v) => v.is_default);
        if (!variant)
          throw new BadRequestException(
            `No default option for product: ${product.name}`,
          );
      } else {
        throw new BadRequestException('Item must specify variant_id');
      }

      if (Number(product.store_id) !== store.id) {
        throw new BadRequestException(
          `Product ${product.name} does not belong to this store`,
        );
      }

      const quantity = itemDto.quantity || 1;
      const unitPrice = Number(variant.price);
      const itemTotal = unitPrice * quantity;

      totalAmount += itemTotal;

      const orderItem = this.orderItemRepo.create({
        product,
        variant,
        name: product.name,
        variant_label: variant.label,
        quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
      });

      orderItems.push(orderItem);
    }

    // 4. Create Order
    const order = this.orderRepo.create({
      store,
      customer,
      buyer_name: dto.buyer_name,
      buyer_phone: dto.whatsapp_number, // required
      shipping_address_line1: dto.address_line1 || '',
      shipping_city: dto.area || 'Unknown', // mapped from Area
      notes: dto.notes,
      total_amount: totalAmount,
      shipping_cost: 0, // Delivery fee calculation logic later
      status: OrderStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
      order_source: OrderSource.WHATSAPP, // or WEB if they clicked from web
      items: orderItems,
    });

    const savedOrder = await this.orderRepo.save(order);

    // 5. Generate Link
    // Need random token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const orderLink = this.orderLinkRepo.create({
      order: savedOrder,
      token: token, // Should be unique
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.orderLinkRepo.save(orderLink);

    // 6. Generate WhatsApp Message & Link
    const waMessage = this.whatsappService.generateOrderMessage(savedOrder);
    const waLink = this.whatsappService.generateClickToChatLink(
      savedOrder.buyer_phone,
      waMessage,
    );

    return {
      order: {
        id: savedOrder.id,
        total_amount: savedOrder.total_amount,
        status: savedOrder.status,
      },
      whatsapp_link: waLink,
      track_link: `/track/${token}`,
    };
  }

  async findAll(storeId: number, dto: ListOrdersDto) {
    const {
      status,
      buyer_name,
      buyer_phone,
      buyer_email,
      created_from,
      created_to,
      sort_by = 'created_at',
      sort_order = SortOrder.DESC,
      page,
      limit,
    } = dto;

    const where: FindOptionsWhere<Order> = {
      store: { id: storeId },
    };

    if (status) {
      where.status = status;
    }
    if (buyer_name) {
      where.buyer_name = Like(`%${buyer_name}%`);
    }
    if (buyer_phone) {
      where.buyer_phone = Like(`%${buyer_phone}%`);
    }
    if (buyer_email) {
      where.buyer_email = Like(`%${buyer_email}%`);
    }
    if (created_from && created_to) {
      where.created_at = Between(created_from, created_to);
    } else if (created_from) {
      where.created_at = MoreThanOrEqual(created_from);
    } else if (created_to) {
      where.created_at = LessThanOrEqual(created_to);
    }

    const order: FindOptionsOrder<Order> = {};
    if (sort_by) {
      order[sort_by] = sort_order;
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
      relations: { items: { product: true }, customer: true },
    });

    return {
      items,
      total,
      page,
      limit,
      last_page: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, storeId: number) {
    const order = await this.orderRepo.findOne({
      where: { id, store: { id: storeId } },
      relations: {
        items: { product: true, variant: true },
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, storeId: number, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id, storeId);
    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  async updateTracking(
    id: number,
    storeId: number,
    dto: UpdateOrderTrackingDto,
  ) {
    const order = await this.findOne(id, storeId);
    if (dto.tracking_number) {
      order.tracking_number = dto.tracking_number;
    }

    if (dto.tracking_number && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.SHIPPED;
    }

    return this.orderRepo.save(order);
  }

  async updateNotes(id: number, storeId: number, dto: UpdateOrderNotesDto) {
    const order = await this.findOne(id, storeId);
    order.internal_notes = dto.internal_notes;
    return this.orderRepo.save(order);
  }

  async updatePaymentStatus(
    id: number,
    storeId: number,
    dto: UpdatePaymentStatusDto,
  ) {
    const order = await this.findOne(id, storeId);
    order.payment_status = dto.status;
    return this.orderRepo.save(order);
  }
}

