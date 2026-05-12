import { forwardRef, Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { coachRepository } from './coach.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ClassScheduleModule } from 'src/class_schedule/class_schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    NotificationsModule,
    ClassScheduleModule,
  ],
  controllers: [CoachController],
  providers: [CoachService, coachRepository],
  exports: [coachRepository],
})
export class CoachModule {}
