import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookModule } from 'src/facebook/facebook.module';
import { FacebookService } from 'src/facebook/facebook.service';
import { Notification } from 'src/notifications/entities/notification.entity';

import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { UserIdentity } from '../users/entities/user-identity.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSession,
      User,
      UserIdentity,
      FacebookPage,
      Notification,
    ]),
    PassportModule.register({ defaultStrategy: CONSTANTS.AUTH.JWT }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME },
      }),
    }),
    FacebookModule,
  ],
  providers: [AuthService, JwtStrategy, FacebookStrategy, FacebookService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule.forFeature([UserSession])],
})
export class AuthModule {}
