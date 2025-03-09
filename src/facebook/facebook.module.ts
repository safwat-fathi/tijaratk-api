import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

import { FacebookPage } from './entities/facebook-page.entity';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookPage, Notification, User])],
  controllers: [FacebookController],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule {}
