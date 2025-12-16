import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const THIRTY_MINUTES_IN_SECONDS = 60 * 30;

export const THEME_EDITOR_SCOPE = 'storefront:edit-theme';

export interface ThemeEditorTokenPayload {
  sub: number;
  storefrontId: number;
  scope: string[];
}

@Injectable()
export class ThemeEditorTokenService {
  private readonly jwt: JwtService;
  private readonly secret: string;
  private readonly expiresInSeconds: number;

  constructor() {
    this.secret =
      process.env.THEME_EDITOR_JWT_SECRET || process.env.JWT_SECRET || 'secret';
    const configuredExpires = Number(process.env.THEME_EDITOR_TOKEN_EXPIRES_IN);
    this.expiresInSeconds = Number.isFinite(configuredExpires)
      ? configuredExpires
      : THIRTY_MINUTES_IN_SECONDS;

    this.jwt = new JwtService({
      secret: this.secret,
      signOptions: { expiresIn: this.expiresInSeconds },
    });
  }

  sign(payload: ThemeEditorTokenPayload) {
    return this.jwt.sign(payload, {
      secret: this.secret,
      expiresIn: this.expiresInSeconds,
    });
  }

  verify(token: string): ThemeEditorTokenPayload {
    return this.jwt.verify(token, { secret: this.secret });
  }

  expiresAtFromNow() {
    return new Date(Date.now() + this.expiresInSeconds * 1000);
  }
}
