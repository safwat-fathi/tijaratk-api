import { Injectable } from '@nestjs/common';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class WhatsappService {
  generateOrderMessage(order: Order): string {
    const itemsList = order.items
      .map((item) => {
        const variantText = item.variant_label ? `(${item.variant_label})` : '';
        return `- ${item.name} ${variantText} x${item.quantity} — ${item.total_price} EGP`;
      })
      .join('\n');

    // Assuming Order entity has shipping_cost, total_amount, buyer_name, shipping_city, notes
    // And shipping_address_line1 if needed. Using shipping_city as "Area" per flow doc.

    const message = `🟢 NEW ORDER #${order.tracking_number || order.id}

👤 Name: ${order.buyer_name}
📍 Area: ${order.shipping_city}

📦 Items:
${itemsList}

💰 Total:
Subtotal: ${this.calculateSubtotal(order)} EGP
Delivery: ${order.shipping_cost} EGP
TOTAL: ${order.total_amount} EGP

Notes: ${order.notes || 'None'}`;

    return message;
  }

  generateClickToChatLink(phoneNumber: string, message: string): string {
    // Basic sanitization of phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  private calculateSubtotal(order: Order): number {
    // Total amount usually includes shipping.
    // Subtotal = Total - Shipping
    return Number(order.total_amount) - Number(order.shipping_cost);
  }
}
