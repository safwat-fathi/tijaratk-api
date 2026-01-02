import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false, // false means expired tokens will be rejected
    });
  }

  async validate(payload: any): Promise<{ id: number; email: string | null }> {
    // Note: email can be null for Facebook-only users where Facebook doesn't provide an email
    return {
      id: payload.sub,
      email: payload.email || null,
    };
  }
}
