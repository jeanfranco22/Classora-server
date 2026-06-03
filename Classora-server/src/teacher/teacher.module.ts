import { forwardRef, Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { TeacherRepository } from './teacher.repository';
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
    forwardRef(() => ClassScheduleModule),
  ],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherRepository],
})
export class TeacherModule {}
