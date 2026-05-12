import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './users.entity';
import { usersRepository } from './users.repository';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, usersRepository],
  exports: [UsersService, usersRepository],
})
export class UsersModule {}
