import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

const getRequiredGoogleConfig = (
  configService: ConfigService,
  key: string,
  fallback: string,
) => configService.get<string>(key)?.trim() || fallback;

@Injectable()
// Esta clase es la que Passport va a usar cuando alguien entre a /auth/google
// Básicamente: le enseña a Nest cómo hablar con Google OAuth.
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super({
      // clientID = "quién soy yo para Google"
      // Google te lo dio cuando creaste el OAuth Client
      clientID: getRequiredGoogleConfig(
        configService,
        'GOOGLE_CLIENT_ID',
        'google-client-id-not-configured',
      ),

      // clientSecret = contraseña privada entre nuestro backend y Google
      clientSecret: getRequiredGoogleConfig(
        configService,
        'GOOGLE_CLIENT_SECRET',
        'google-client-secret-not-configured',
      ),

      // a dónde Google vuelve después del login
      callbackURL: getRequiredGoogleConfig(
        configService,
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3030/auth/google/callback',
      ),

      // qué datos le pedimos a Google
      // profile = nombre + foto
      // email = mail del usuario
      scope: ['email', 'profile'],

      //  fuerza a Google a mostrar siempre el selector de cuentas
      prompt: 'select_account',
    } as any);
  }

  // ESTA ES LA FUNCIÓN MÁS IMPORTANTE DE TODO GOOGLE LOGIN
  // Google → Passport → validate() → req.user
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    // Google nos devuelve un objeto gigante con mil datos del usuario
    // nosotros agarramos solo lo que nos sirve

    const email = profile.emails?.[0]?.value;

    const user = {
      // mail del usuario Google
      email,

      // id único que Google le da al usuario (MUY importante)
      // esto es lo que después vamos a guardar en DB
      googleId: profile.id,

      // nombre completo que tiene en su cuenta Google
      name: profile.displayName,

      // foto de perfil de Google
      picture: profile.photos?.[0]?.value,
    };

    // done() es la forma en la que Passport le pasa info a NestJS
    // TODO lo que pongamos acá termina en req.user en el controller
    return done(null, user);
  }
}
