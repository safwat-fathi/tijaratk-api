import { Injectable, Logger } from '@nestjs/common';
import { PurchaseAddonDto } from '../dto/purchase-addon.dto';
import { AddonsService } from './addons.service';
import { UserSubscriptionsService } from './user-subscriptions.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
    private readonly addonsService: AddonsService,
  ) {}

  async processPayment(userId: number, amount: number, description: string): Promise<boolean> {
    // Placeholder payment processing
    this.logger.log(`Processing payment for User ${userId}: $${amount / 100} - ${description}`);
    return true; // Always succeed for now
  }

  async handleUpgrade(userId: number, planId: number): Promise<void> {
    // 1. Process mock payment (diff or full price)
    // 2. Upgrade plan
    await this.processPayment(userId, 1500, 'Plan Upgrade'); // Example amount
    await this.userSubscriptionsService.upgradePlan(userId, planId);
  }

  async handleDowngrade(userId: number, planId: number): Promise<void> {
    await this.userSubscriptionsService.downgradePlan(userId, planId);
  }

  async handleAddonPurchase(userId: number, dto: PurchaseAddonDto): Promise<void> {
    // 1. Get Addon price
    const addon = await this.addonsService.findOne(dto.addonId);
    const total = addon.price * dto.quantity;

    // 2. Process mock payment
    await this.processPayment(userId, total, `Purchase Addon: ${addon.name} x${dto.quantity}`);
    
    // 3. Provision addon
    await this.addonsService.purchaseAddon(userId, dto);
  }
}
