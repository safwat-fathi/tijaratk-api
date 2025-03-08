import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/users/entities/user.entity';

import { FacebookPage } from './entities/facebook-page.entity';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacebookPage, User, Notification]),
    NotificationsModule,
  ],
  controllers: [FacebookController],
  providers: [FacebookService],
})
export class FacebookModule {}
