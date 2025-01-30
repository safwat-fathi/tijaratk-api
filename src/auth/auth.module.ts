import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import CONSTANTS from 'src/common/constants';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookService } from 'src/facebook/facebook.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, User, FacebookPage]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: CONSTANTS.SESSION.EXPIRATION_TIME },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, FacebookStrategy, FacebookService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule.forFeature([UserSession])],
})
export class AuthModule {}
