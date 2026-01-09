import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user || !user.global_roles?.includes('admin')) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
