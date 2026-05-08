import type { Request } from 'express';
import type { User } from 'src/users/users.entity';

export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
