import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    console.log('AdminGuard Check:', {
      userExists: !!user,
      role: user?.role,
      expected: UserRole.ADMIN,
    });

    if (!user || user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
