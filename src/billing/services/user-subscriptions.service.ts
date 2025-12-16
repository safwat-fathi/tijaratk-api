import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { UserSubscription } from '../entities/user-subscription.entity';
import { AddonsService } from './addons.service';
import { PlansService } from './plans.service';

@Injectable()
export class UserSubscriptionsService {
  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    private readonly plansService: PlansService,
    private readonly addonsService: AddonsService,
  ) {}

  async getUserSubscription(userId: number): Promise<UserSubscription> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: {
        userId,
      },
      relations: { plan: true },
      order: { created_at: 'DESC' },
    });

    if (!subscription) {
      return this.createFreeSubscription(userId);
    }

    return subscription;
  }

  async createFreeSubscription(userId: number): Promise<UserSubscription> {
    const freePlan = await this.plansService.findBySlug('free');
    
    // Monthly cycle by default
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscription = this.userSubscriptionRepository.create({
      userId,
      plan: freePlan,
      status: 'active',
      current_period_start: now,
      current_period_end: nextMonth,
      cancel_at_period_end: false,
    });

    return this.userSubscriptionRepository.save(subscription);
  }

  async createSubscription(
    userId: number,
    planId: number,
  ): Promise<UserSubscription> {
    const plan = await this.plansService.findOne(planId);

    // Archive old subscription if exists (set status to expired/cancelled)
    await this.userSubscriptionRepository.update(
      { userId },
      { status: 'expired' },
    );

    const now = new Date();
    let nextBilling = new Date(now);
    if (plan.billing_cycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    const subscription = this.userSubscriptionRepository.create({
      userId,
      plan,
      status: 'active',
      current_period_start: now,
      current_period_end: nextBilling,
      next_billing_date: nextBilling,
      cancel_at_period_end: false,
    });

    return this.userSubscriptionRepository.save(subscription);
  }

  async upgradePlan(userId: number, planId: number): Promise<UserSubscription> {
    return this.createSubscription(userId, planId);
  }

  async downgradePlan(userId: number, planId: number): Promise<UserSubscription> {
    return this.createSubscription(userId, planId);
  }

  async cancelSubscription(userId: number): Promise<UserSubscription> {
    const sub = await this.getUserSubscription(userId);
    sub.cancel_at_period_end = true;
    return this.userSubscriptionRepository.save(sub);
  }

  async reactivateSubscription(userId: number): Promise<UserSubscription> {
    const sub = await this.getUserSubscription(userId);
    sub.cancel_at_period_end = false;
    return this.userSubscriptionRepository.save(sub);
  }

  async getUserLimits(userId: number): Promise<{
    max_products: number | null;
    max_posts: number | null;
    max_messages: number | null;
    max_staff: number;
    has_custom_domain: boolean;
    has_theme_access: boolean;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription.plan;
    const addons = await this.addonsService.getUserAddons(userId);

    let max_products = plan.max_products;
    let max_posts = plan.max_posts_per_month;
    let max_messages = plan.max_messages_per_month;
    let max_staff = plan.max_staff_users;

    // Add-ons aggregation
    for (const addon of addons) {
      if (addon.addon.addon_type === 'product_pack') {
        if (max_products !== null) max_products += addon.addon.provides_quantity;
      } else if (addon.addon.addon_type === 'posts_pack') {
        if (max_posts !== null) max_posts += addon.addon.provides_quantity;
      } else if (addon.addon.addon_type === 'message_pack') {
        if (max_messages !== null) max_messages += addon.addon.provides_quantity;
      } else if (addon.addon.addon_type === 'staff_seat') {
         max_staff += addon.addon.provides_quantity;
      }
    }

    return {
      max_products,
      max_posts,
      max_messages,
      max_staff,
      has_custom_domain: plan.has_custom_domain,
      has_theme_access: plan.has_theme_access,
    };
  }
}
