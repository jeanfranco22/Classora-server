import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const requiredConfig = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
    ];
    const isGoogleConfigured = requiredConfig.every((key) =>
      Boolean(this.configService.get<string>(key)?.trim()),
    );

    if (!isGoogleConfigured) {
      throw new ServiceUnavailableException(
        'Google OAuth no está configurado. Define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_CALLBACK_URL.',
      );
    }

    return super.canActivate(context);
  }
}
