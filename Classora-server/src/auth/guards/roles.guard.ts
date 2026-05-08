import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../common/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //  Leeo qué roles pide el endpoint (si no pide, dejo pasar)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    //  Traigo el usuario que ya metió JwtAuthGuard en la request
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user: JwtPayload }).user;
    // Comparo rol del usuario vs roles permitidos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tenes permisos');
    }

    return true;
  }
}
