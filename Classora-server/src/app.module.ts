import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ClassModule } from './class/class.module';
import { ClassScheduleModule } from './class_schedule/class_schedule.module';
import { CronsModule } from './crons/crons.module';
import { FilesModule } from './files/files.module';
import { MembershipModule } from './membership/membership.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { ReservationModule } from './reservation/reservation.module';
import { TeacherModule } from './teacher/teacher.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    ScheduleModule.forRoot(),
    NotificationsModule,
    UsersModule,
    TeacherModule,
    AuthModule,
    FilesModule,
    ClassModule,
    ClassScheduleModule,
    MembershipModule,
    PaymentsModule,
    ChatModule,
    ReservationModule,
    CronsModule,
  ],
})
export class AppModule {}
