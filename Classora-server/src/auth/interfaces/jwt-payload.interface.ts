import { Role } from '../../common/roles.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
