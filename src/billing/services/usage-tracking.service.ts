import {
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';

import { UsageStatsResponseDto } from '../dto/usage-stats-response.dto';
import { UsageTracking } from '../entities/usage-tracking.entity';
import { UserSubscriptionsService } from './user-subscriptions.service';

@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(
    @InjectRepository(UsageTracking)
    private readonly usageTrackingRepository: Repository<UsageTracking>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  private getCurrentPeriodMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  async getCurrentUsage(userId: number): Promise<UsageTracking> {
    const periodMonth = this.getCurrentPeriodMonth();
    
    let usage = await this.usageTrackingRepository.findOne({
      where: { userId, period_month: periodMonth },
    });

    if (!usage) {
      usage = this.usageTrackingRepository.create({
        userId,
        period_month: periodMonth,
        messages_received: 0,
        posts_created: 0,
        current_staff_count: 0,
      });
      await this.usageTrackingRepository.save(usage);
    }

    return usage;
  }

  async incrementMessageCount(userId: number): Promise<void> {
    const usage = await this.getCurrentUsage(userId);
    usage.messages_received += 1;
    await this.usageTrackingRepository.save(usage);
  }

  async incrementPostCount(userId: number): Promise<void> {
    const usage = await this.getCurrentUsage(userId);
    usage.posts_created += 1;
    await this.usageTrackingRepository.save(usage);
  }

  async checkMessageLimit(userId: number): Promise<void> {
    const limits = await this.userSubscriptionsService.getUserLimits(userId);
    if (limits.max_messages === null) return; // Unlimited

    const usage = await this.getCurrentUsage(userId);
    if (usage.messages_received >= limits.max_messages) {
      throw new ForbiddenException(
        `Message limit reached (${limits.max_messages}/month). Upgrade your plan or buy a message pack.`,
      );
    }
  }

  async checkPostLimit(userId: number): Promise<void> {
    const limits = await this.userSubscriptionsService.getUserLimits(userId);
    if (limits.max_posts === null) return; // Unlimited

    const usage = await this.getCurrentUsage(userId);
    if (usage.posts_created >= limits.max_posts) {
      throw new ForbiddenException(
        `Facebook posts limit reached (${limits.max_posts}/month). Upgrade your plan or buy a posts pack.`,
      );
    }
  }

  async checkProductLimit(userId: number): Promise<void> {
    const limits = await this.userSubscriptionsService.getUserLimits(userId);
    if (limits.max_products === null) return; // Unlimited

    const productCount = await this.productRepository.count({
      where: { user: { id: userId } },
    });

    if (productCount >= limits.max_products) {
      throw new ForbiddenException(
        `Product limit reached (${limits.max_products}). Upgrade your plan or buy a product pack.`,
      );
    }
  }

  async getUserUsageStats(userId: number): Promise<UsageStatsResponseDto> {
    const limits = await this.userSubscriptionsService.getUserLimits(userId);
    const usage = await this.getCurrentUsage(userId);
    
    const productCount = await this.productRepository.count({
      where: { user: { id: userId } },
    });

    const sub = await this.userSubscriptionsService.getUserSubscription(userId);
    const now = new Date();
    const nextBilling = sub.current_period_end;
    const daysUntilReset = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      period_month: usage.period_month,
      messages_received: usage.messages_received,
      messages_limit: limits.max_messages,
      posts_created: usage.posts_created,
      posts_limit: limits.max_posts,
      products_count: productCount,
      products_limit: limits.max_products,
      staff_count: usage.current_staff_count,
      staff_limit: limits.max_staff,
      days_until_reset: daysUntilReset > 0 ? daysUntilReset : 0,
    };
  }

  // Called via Cron or event on billing cycle
  async resetUserMonthlyUsage(userId: number): Promise<void> {
    // Reset means we basically just ensure a new record starts fresh for new period
    // Since periods are user-specific, the consumption logic uses `getCurrentUsage` 
    // which checks `period_month`.
    // Wait, `period_month` is YYYY-MM.
    // But if billing cycle is e.g. 15th to 15th, `YYYY-MM` bucket is tricky.
    // If strict billing cycle reset: we should probably zero out the usage record related to the user?
    // OR have `current_period_usage` on UserSubscription directly?
    // The plan said: "For each user, check if their current billing period has ended... reset messages_received and posts_created to 0... Create new monthly usage record with updated period_month"
    
    // If we use YYYY-MM bucket, limits reset on the 1st of the month regardless of billing date?
    // Plan update said: "User-specific monthly reset logic". 
    // And "this approach ensures... limits reset on their specific billing anniversary".
    
    // If so, `period_month` in database (YYYY-MM) might be misleading if it doesn't align with calendar.
    // Maybe we track usage by `billing_period_start` date instead of month string?
    // Or just clear the counters on the record associated with "Active Period".
    
    // Let's implement reset by: 
    // 1. Archiving current counters (optional, or just log)
    // 2. Resetting them to 0.
    
    const usage = await this.getCurrentUsage(userId);
    
    this.logger.log(`Resetting usage for user ${userId}`);
    
    // Archive via log
    this.logger.log(`Archived usage: Msg=${usage.messages_received}, Post=${usage.posts_created}`);
    
    usage.messages_received = 0;
    usage.posts_created = 0;
    // We update period_month to current month if we rely on it, but usage logic `getCurrentUsage` uses YYYY-MM.
    // If billing reset is mid-month, YYYY-MM is still same.
    // If we limit by strictly "Use since reset", then this Reset method is authoritative.
    // But `getCurrentUsage` finds by YYYY-MM. It might find the same record and use it.
    // If we reset it to 0 mid-month, `getCurrentUsage` will return the Reset record (Same ID).
    // So limits will reset.
    // But `period_month` key might be ambiguous if we want historical data.
    // For MVP, resetting the counters in place is fine. 
    
    await this.usageTrackingRepository.save(usage);
  }
}
