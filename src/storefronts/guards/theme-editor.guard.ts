import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import {
  THEME_EDITOR_SCOPE,
  ThemeEditorTokenService,
} from '../theme-editor-token.service';

@Injectable()
export class ThemeEditorAuthGuard implements CanActivate {
  constructor(private readonly tokenService: ThemeEditorTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing theme editor token');
    }

    try {
      const payload = this.tokenService.verify(token);

      if (!payload.scope?.includes(THEME_EDITOR_SCOPE)) {
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

  private extractToken(request: Request) {
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
