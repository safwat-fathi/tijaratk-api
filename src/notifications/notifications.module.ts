import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { Notification } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WebPushService } from './web-push.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, PushSubscription, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, WebPushService],
  exports: [NotificationsService, NotificationsGateway, WebPushService],
})
export class NotificationsModule {}

