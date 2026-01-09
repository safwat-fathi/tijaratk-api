import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CustomOrderRequest,
  CustomRequestStatus,
} from './entities/custom-order-request.entity';
import {
  CreateCustomOrderDto,
  QuoteCustomOrderDto,
} from './dto/custom-order.dto';
import { Order, PaymentStatus, OrderStatus } from './entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class CustomOrdersService {
  constructor(
    @InjectRepository(CustomOrderRequest)
    private readonly customOrderRequestRepo: Repository<CustomOrderRequest>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  /**
   * Create a new custom order request for a store
   * Follows guest checkout pattern - resolves or creates customer by whatsapp number
   */
  async create(storeId: number, dto: CreateCustomOrderDto) {
    // Resolve customer (guest checkout pattern - aligned with OrdersService.createFromPublic)
    let customer: Customer | null = null;
    if (dto.buyer_phone) {
      const phone = dto.buyer_phone.replace(/\D/g, '');
      customer = await this.customerRepo.findOne({
        where: { whatsapp_number: phone },
      });

      if (!customer) {
        customer = this.customerRepo.create({
          name: dto.buyer_name,
          whatsapp_number: phone,
        });
        await this.customerRepo.save(customer);
      } else if (dto.buyer_name && !customer.name) {
        // Update name if provided and previously null
        customer.name = dto.buyer_name;
        await this.customerRepo.save(customer);
      }
    }

    const request = this.customOrderRequestRepo.create({
      store_id: storeId,
      customer_id: customer?.id,
      buyer_name: dto.buyer_name,
      buyer_phone: dto.buyer_phone,
      description: dto.description,
      budget: dto.budget,
      images: dto.images,
      status: CustomRequestStatus.PENDING,
    });

    return this.customOrderRequestRepo.save(request);
  }

  /**
   * Find all custom order requests for a store
   */
  async findAllForStore(storeId: number) {
    return this.customOrderRequestRepo.find({
      where: { store_id: storeId },
      relations: ['customer'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find a single custom order request by ID
   */
  async findOne(id: number) {
    const request = await this.customOrderRequestRepo.findOne({
      where: { id },
      relations: ['store', 'customer', 'order'],
    });

    if (!request) {
      throw new NotFoundException('Custom order request not found');
    }

    return request;
  }

  /**
   * Quote a custom order request (seller action)
   */
  async quote(id: number, storeId: number, dto: QuoteCustomOrderDto) {
    const request = await this.customOrderRequestRepo.findOne({
      where: { id, store_id: storeId },
    });

    if (!request) {
      throw new NotFoundException('Custom order request not found');
    }

    if (request.status !== CustomRequestStatus.PENDING) {
      throw new BadRequestException(
        'Can only quote pending custom order requests',
      );
    }

    request.quoted_price = dto.price;
    request.quoted_shipping_cost = dto.shipping_cost ?? 0;
    request.seller_notes = dto.notes;
    request.quoted_at = new Date();
    request.status = CustomRequestStatus.QUOTED;

    return this.customOrderRequestRepo.save(request);
  }

  /**
   * Accept a quoted custom order request (buyer action)
   * This creates an actual order from the custom request
   */
  async accept(id: number) {
    const request = await this.customOrderRequestRepo.findOne({
      where: { id },
      relations: ['store', 'customer'],
    });

    if (!request) {
      throw new NotFoundException('Custom order request not found');
    }

    if (request.status !== CustomRequestStatus.QUOTED) {
      throw new BadRequestException('Can only accept quoted requests');
    }

    // Create the order from the custom request
    const order = this.orderRepo.create({
      store: request.store,
      customer: request.customer,
      buyer_name: request.buyer_name,
      buyer_phone: request.buyer_phone,
      shipping_address_line1: 'To be confirmed',
      shipping_city: 'To be confirmed',
      total_amount:
        Number(request.quoted_price) +
        Number(request.quoted_shipping_cost ?? 0),
      shipping_cost: Number(request.quoted_shipping_cost ?? 0),
      status: OrderStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
      notes: request.description,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Update the custom request
    request.status = CustomRequestStatus.ACCEPTED;
    request.orderId = Number(savedOrder.id);
    await this.customOrderRequestRepo.save(request);

    return { request, order: savedOrder };
  }

  /**
   * Reject a custom order request
   */
  async reject(id: number, storeId: number) {
    const request = await this.customOrderRequestRepo.findOne({
      where: { id, store_id: storeId },
    });

    if (!request) {
      throw new NotFoundException('Custom order request not found');
    }

    if (
      request.status !== CustomRequestStatus.PENDING &&
      request.status !== CustomRequestStatus.QUOTED
    ) {
      throw new BadRequestException('Cannot reject this request');
    }

    request.status = CustomRequestStatus.REJECTED;
    return this.customOrderRequestRepo.save(request);
  }
}
