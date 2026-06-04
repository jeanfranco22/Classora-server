import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('Allowed Origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3030);
}
bootstrap();
