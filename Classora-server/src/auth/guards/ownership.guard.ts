import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import { Role } from 'src/common/roles.enum';

export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;
    const userId = request.params.id;

    if (user.role === Role.Admin) return true;
    if (user.id === userId) return true;

    throw new ForbiddenException('No tiene permisos para realizar esta acción');
  }
}
