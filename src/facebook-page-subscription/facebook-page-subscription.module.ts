import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

import { FacebookPageSubscription } from './entities/facebook-page-subscription.entity';
import { FacebookPageSubscriptionController } from './facebook-page-subscription.controller';
import { FacebookPageSubscriptionService } from './facebook-page-subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookPageSubscription, User])],
  controllers: [FacebookPageSubscriptionController],
  providers: [FacebookPageSubscriptionService, UsersService],
})
export class FacebookPageSubscriptionModule {}
