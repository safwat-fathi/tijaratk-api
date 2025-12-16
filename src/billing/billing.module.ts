import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Product } from 'src/products/entities/product.entity';

import { AddonsController } from './controllers/addons.controller';
import { PlansController } from './controllers/plans.controller';
import { UsageController } from './controllers/usage.controller';
import { UserSubscriptionsController } from './controllers/user-subscriptions.controller';

import { Addon } from './entities/addon.entity';
import { Plan } from './entities/plan.entity';
import { UsageTracking } from './entities/usage-tracking.entity';
import { UserAddon } from './entities/user-addon.entity';
import { UserSubscription } from './entities/user-subscription.entity';

import { PlanLimitGuard } from './guards/plan-limit.guard';
import { FeatureAccessGuard } from './guards/feature-access.guard';

import { AddonsService } from './services/addons.service';
import { BillingService } from './services/billing.service';
import { PlansService } from './services/plans.service';
import { UsageTrackingService } from './services/usage-tracking.service';
import { UserSubscriptionsService } from './services/user-subscriptions.service';
import { UsageResetTask } from './tasks/usage-reset.task';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      UserSubscription,
      Addon,
      UserAddon,
      UsageTracking,
      User,
      Product,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [
    PlansController,
    UserSubscriptionsController,
    AddonsController,
    UsageController,
  ],
  providers: [
    PlansService,
    AddonsService,
    UserSubscriptionsService,
    UsageTrackingService,
    BillingService,
    PlanLimitGuard,
    FeatureAccessGuard,
    UsageResetTask,
  ],
  exports: [
    UserSubscriptionsService,
    UsageTrackingService,
    PlanLimitGuard,
    FeatureAccessGuard,
  ],
})
export class BillingModule {}
