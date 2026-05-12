import { Module } from '@nestjs/common';
import { CronsService } from './crons.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  providers: [CronsService],
  exports: [CronsService],
  imports: [UsersModule, NotificationsModule],
})
export class CronsModule {}
