import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../users/entities/user.entity';
import { UserSession } from '../../users/entities/user-session.entity';

/**
 * JWT payload structure for authenticated requests.
 */
export interface JwtPayload {
  sub: number; // user_id
  phone?: string;
  email?: string;
  global_roles: string[];
  store_roles: Record<string, string[]>; // { store_id: [role_names] }
}

/**
 * Authenticated user context attached to request.
 */
export interface AuthenticatedUser {
  id: number;
  phone?: string;
  email?: string;
  global_roles: string[];
  store_roles: Record<string, string[]>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  /**
   * Validate and transform JWT payload into request user object.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'status'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Check if session exists (logout deletes session)
    // We check if *any* session exists for the user because:
    // 1. Logout deletes all sessions for the user
    // 2. We don't track access tokens in DB, only refresh tokens
    // 3. If no sessions exist, it means the user logged out or session expired
    const session = await this.sessionRepository.findOne({
      where: { user: { id: payload.sub } },
      select: ['id'],
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    return {
      id: payload.sub,
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      global_roles: payload.global_roles || [],
      store_roles: payload.store_roles || {},
    };
  }
}
