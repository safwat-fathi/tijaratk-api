import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { FacebookPage } from './entities/facebook-page.entity';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';

@Module({
  imports: [TypeOrmModule.forFeature([FacebookPage, User])],
  controllers: [FacebookController],
  providers: [FacebookService],
})
export class FacebookModule {}
