import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

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
  constructor() {
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
    return {
      id: payload.sub,
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      global_roles: payload.global_roles || [],
      store_roles: payload.store_roles || {},
    };
  }
}
