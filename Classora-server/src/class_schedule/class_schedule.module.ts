import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { ClassesScheduleController } from './class_schedule.controller';
import { ClassScheduleService } from './class_schedule.service';
import { ClassScheduleRepository } from './class_schedule.repository';
import { Class } from 'src/class/class.entity';
import { User } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { ClassModule } from 'src/class/class.module';
import { CoachModule } from 'src/coach/coach.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class_schedule, Class, User]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => JwtModule),
    forwardRef(() => ClassModule),
    forwardRef(() => CoachModule),
  ],
  controllers: [ClassesScheduleController],
  providers: [ClassScheduleService, ClassScheduleRepository],
  exports: [ClassScheduleService, ClassScheduleRepository],
})
export class ClassScheduleModule {}
