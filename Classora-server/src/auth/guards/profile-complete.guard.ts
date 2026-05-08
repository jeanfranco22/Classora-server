import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import type { AuthenticatedRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class ProfileCompleteGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = req.user.id;

    const url: string = req.originalUrl || req.url || '';

    // siempre permitidos aunque el perfil esté incompleto
    if (url.includes('/users/complete-profile')) return true;
    if (url.includes('/auth/me')) return true;

    const user = await this.usersService.getUserEntityById(userId);

    if (user.authProvider === 'google' && user.isProfileComplete === false) {
      throw new ForbiddenException(
        'Debes completar tu perfil antes de continuar',
      );
    }

    return true;
  }
}
