import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './interfaces/google-user.interface';
import { Res } from '@nestjs/common';
import type { Response } from 'express';
import * as authRequestInterface from './interfaces/auth-request.interface';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // LOGIN
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  // SIGNUP REAL
  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }
  // AUTH/ME → devuelve el usuario del token (sin password)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: authRequestInterface.AuthenticatedRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = req.user;
    return safeUser;
  }

  // GOOGLE

  // esta ruta NO hace nada visible
  // solo dispara a Passport → Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // passport automáticamente redirige a Google
  }

  // Google vuelve acá después del login
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: { user: GoogleUser },
    @Res({ passthrough: false }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);

    const FRONT_URL =
      this.configService.get<string>('FRONTEND_URL') + '/auth/callback';

    const redirectUrl = `${FRONT_URL}?token=${encodeURIComponent(result.accessToken)}&isProfileComplete=${result.user.isProfileComplete}`;

    return res.redirect(redirectUrl);
  }
}
