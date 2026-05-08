import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/roles.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { CreateUserDto } from '../users/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateUserGoogleDto } from '../users/dto/createUser-google.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    role: Role;
  }> {
    const e = (email || '').trim().toLowerCase();

    let user: User;
    try {
      user = await this.usersService.getByEmail({ email: e });
    } catch {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario dado de baja');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta cuenta fue creada con Google, inicia sesión con Google',
      );
    }

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const fullUser = await this.usersService.getUserEntityById(user.id);

    return {
      accessToken,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        isProfileComplete: fullUser.isProfileComplete,
        profileImg: fullUser.profileImg,
        cloudinaryId: fullUser.cloudinaryId ?? null,
      },
    };
  }

  async signup(dto: CreateUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const created = await this.usersService.createUser({
      ...dto,
      password: passwordHasheada,
    });

    try {
      await this.notificationsService.sendWelcomeEmail(
        created.name,
        created.email,
      );
    } catch (error) {
      console.error('Error enviando welcome email:', error);
    }

    return await this.login({
      id: created.id,
      email: created.email,
      role: created.role,
    });
  }

  async googleLogin(googleUser: {
    email: string;
    googleId: string;
    name: string;
    picture?: string;
  }) {
    const email = (googleUser.email || '').trim().toLowerCase();
    const googleId = (googleUser.googleId || '').trim();

    if (!email) {
      throw new UnauthorizedException('Google no devolvió email');
    }
    if (!googleId) {
      throw new UnauthorizedException('Google no devolvió googleId');
    }

    const dto: CreateUserGoogleDto = {
      email,
      googleId: googleUser.googleId,
      name: googleUser.name,
      profileImg: googleUser.picture,
    };

    const { user, isNew } = await this.usersService.findOrCreateByGoogle(dto);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario dado de baja');
    }

    if (isNew) {
      try {
        await this.notificationsService.sendWelcomeEmail(user.name, user.email);
      } catch (error) {
        console.error('Error enviando welcome email:', error);
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      provider: 'google',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        profileImg: user.profileImg,
        cloudinaryId: user.cloudinaryId ?? null,
      },
    };
  }
}
