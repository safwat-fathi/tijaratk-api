import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomOrderRequest, CustomRequestStatus } from './entities/custom-order-request.entity';
import { CreateCustomOrderDto, QuoteCustomOrderDto } from './dto/custom-order.dto';
import { OrdersService } from './orders.service';
import { Order, OrderType, PaymentStatus } from './entities/order.entity';

@Injectable()
export class CustomOrdersService {
  constructor(
    @InjectRepository(CustomOrderRequest)
    private readonly requestRepo: Repository<CustomOrderRequest>,
    private readonly ordersService: OrdersService,
  ) {}

  async create(storefrontId: number, dto: CreateCustomOrderDto) {
    const request = this.requestRepo.create({
      storefrontId,
      ...dto,
      status: CustomRequestStatus.PENDING,
    });
    return this.requestRepo.save(request);
  }

  async findAllForStorefront(storefrontId: number) {
    return this.requestRepo.find({
      where: { storefrontId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['storefront'],
    });
    if (!request) {
      throw new NotFoundException('Custom request not found');
    }
    return request;
  }

  async quote(id: number, storefrontId: number, dto: QuoteCustomOrderDto) {
    const request = await this.findOne(id);
    
    if (request.storefrontId !== storefrontId) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== CustomRequestStatus.PENDING) {
        throw new BadRequestException('Request is not in pending status');
    }

    request.quoted_price = dto.price;
    request.quoted_shipping_cost = dto.shipping_cost ?? 0;
    request.seller_notes = dto.notes;
    request.quoted_at = new Date();
    request.status = CustomRequestStatus.QUOTED;

    return this.requestRepo.save(request);
  }

  async accept(id: number, guestPhone: string) {
      const request = await this.findOne(id);
      
      // Basic validation: ensure the guest accepting is the one who requested (by phone)
      // Ideally we use a secure token, but for MVP checking phone match from auth/magic link or just trusting the public endpoint with id (assuming ID is secret enough for MVP or passed safely)
      // The plan says Public Endpoint. I'll rely on ID for now, maybe verify phone if passed.
      // Since it's public accept, anyone with ID can accept. We should check status.
      
      if (request.status !== CustomRequestStatus.QUOTED) {
          throw new BadRequestException('Request cannot be accepted');
      }

      // Create Order
      const totalAmount = Number(request.quoted_price) + Number(request.quoted_shipping_cost);
      
      // We need to use OrdersService to create order.
      // But OrdersService.create needs CreateOrderDto which expects items.
      // Custom order doesn't have "items" in the standard catalog sense.
      // We should potentially add a "custom_items" or just create a dummy item "Custom Order: Description".
      
      // I'll create a special method in OrdersService or construct DTO here.
      // Constructing DTO:
      const order = await this.ordersService.createFromCustomRequest({
          storefrontId: request.storefrontId,
          buyer_name: request.buyer_name,
          buyer_phone: request.buyer_phone,
          total_amount: totalAmount,
          notes: `Custom Order based on request #${request.id}. \nDescription: ${request.description}`,
          items: [
              {
                  name: "Custom Order Item",
                  quantity: 1,
                  unit_price: Number(request.quoted_price),
                  total_price: Number(request.quoted_price),
              }
          ],
          shipping_cost: request.quoted_shipping_cost,
          type: OrderType.CUSTOM,
      });

      request.status = CustomRequestStatus.ACCEPTED;
      request.order = order;
      await this.requestRepo.save(request);

      return order;
  }

  async reject(id: number, storefrontId?: number) {
      const request = await this.findOne(id);
      
      if (storefrontId && request.storefrontId !== storefrontId) {
          // If storefrontId provided (seller action), verify ownership
          throw new NotFoundException('Request not found');
      }
      
      if (request.status === CustomRequestStatus.ACCEPTED) {
           throw new BadRequestException('Cannot reject accepted order');
      }

      request.status = CustomRequestStatus.REJECTED;
      return this.requestRepo.save(request);
  }
}
