import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSubscription } from '../entities/user-subscription.entity';
import { UsageTrackingService } from '../services/usage-tracking.service';

@Injectable()
export class UsageResetTask {
  private readonly logger = new Logger(UsageResetTask.name);

  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    private readonly usageTrackingService: UsageTrackingService,
  ) {}

  @Cron('0 0 * * *') // Run daily at midnight
  async handleUsageReset() {
    this.logger.log('Running daily usage reset task...');

    // Find subscriptions where billing cycle reset is today
    // Logic: if current_period_end is today (ignoring time or handle strictly)
    // Actually, current_period_end is exact timestamp.
    // We want to find subs where current_period_end <= NOW.
    // And status is active.

    const now = new Date();

    const overdueSubscriptions = await this.userSubscriptionRepository
      .createQueryBuilder('sub')
      .where('sub.status = :status', { status: 'active' })
      .andWhere('sub.current_period_end <= :now', { now })
      .getMany();

    this.logger.log(
      `Found ${overdueSubscriptions.length} subscriptions to reset.`,
    );

    for (const sub of overdueSubscriptions) {
      try {
        await this.usageTrackingService.resetUserMonthlyUsage(sub.userId);

        // Update subscription period
        const oldEnd = new Date(sub.current_period_end);
        const newEnd = new Date(oldEnd);

        // Assuming monthly cycle for simplicity of MVP (Plan entity has field, but here we iterate)
        // Ideally check plan.billing_cycle. But assuming mostly monthly for now or fetching plan.
        // Let's assume monthly increment.
        newEnd.setMonth(newEnd.getMonth() + 1);

        sub.current_period_start = oldEnd; // New start is old end
        sub.current_period_end = newEnd;
        sub.next_billing_date = newEnd;

        await this.userSubscriptionRepository.save(sub);

        this.logger.log(
          `Reset usage and updated period for User ${sub.userId}`,
        );
      } catch (err) {
        this.logger.error(`Failed to reset usage for User ${sub.userId}`, err);
      }
    }
  }
}
