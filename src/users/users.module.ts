import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookModule } from 'src/facebook/facebook.module';
import { FacebookService } from 'src/facebook/facebook.service';
import { FacebookPageSubscription } from 'src/facebook-page-subscription/entities/facebook-page-subscription.entity';
import { FacebookPageSubscriptionService } from 'src/facebook-page-subscription/facebook-page-subscription.service';
import { Notification } from 'src/notifications/entities/notification.entity';

import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserIdentity } from './entities/user-identity.entity';
import { UserEventsListener } from './listeners/user-events.listener';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      UserIdentity,
      FacebookPage,
      FacebookPageSubscription,
      Notification,
    ]),
    FacebookModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserEventsListener,
    FacebookService,
    FacebookPageSubscriptionService,
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
