import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookModule } from 'src/facebook/facebook.module';
import { FacebookService } from 'src/facebook/facebook.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { MerchantsModule } from 'src/merchants/merchants.module';

import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { UserIdentity } from '../users/entities/user-identity.entity';
import { AdminProfile } from '../users/entities/admin-profile.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { StoreUserRole } from './entities/store-user-role.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // User & Session
      User,
      UserSession,
      UserIdentity,
      // Profiles
      Merchant,
      AdminProfile,
      // RBAC
      Permission,
      Role,
      UserRole,
      StoreUserRole,
      // Legacy (for existing features)
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
    MerchantsModule,
  ],
  providers: [AuthService, JwtStrategy, FacebookStrategy, FacebookService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
