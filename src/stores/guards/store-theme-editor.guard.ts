import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import {
  STORE_THEME_EDITOR_SCOPE,
  StoreThemeEditorTokenService,
} from '../store-theme-editor-token.service';

@Injectable()
export class StoreThemeEditorAuthGuard implements CanActivate {
  constructor(private readonly tokenService: StoreThemeEditorTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing theme editor token');
    }

    try {
      const payload = this.tokenService.verify(token);

      if (!payload.scope?.includes(STORE_THEME_EDITOR_SCOPE)) {
        throw new ForbiddenException('Insufficient scope for theme editor');
      }

      (request as any).themeEditor = payload;
      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired theme editor token');
    }
  }

  private extractToken(request: Request): string | null {
    const header =
      request.headers['authorization'] || request.headers['Authorization'];
    if (!header || Array.isArray(header)) {
      return null;
    }

    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
