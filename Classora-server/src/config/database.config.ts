import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const parseBoolean = (value: string | undefined, defaultValue = false) => {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
};

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sslEnabled = parseBoolean(process.env.DATABASE_SSL, true);
  const synchronize = parseBoolean(
    process.env.DATABASE_SYNCHRONIZE,
    !isProduction,
  );

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    autoLoadEntities: true,
    synchronize,
    logging: ['error', 'warn', 'schema'],
    ssl: sslEnabled
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };

  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      url: process.env.DATABASE_URL,
    };
  }

  return {
    ...baseConfig,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
});
