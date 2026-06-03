import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/auth-request.interface';
import { GoogleUser } from './interfaces/google-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    const { password, ...safeUser } = req.user;
    return safeUser;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    return undefined;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: { user: GoogleUser },
    @Res({ passthrough: false }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(
      result.accessToken,
    )}&isProfileComplete=${result.user.isProfileComplete}`;

    return res.redirect(redirectUrl);
  }
}
