import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ClassModule } from './class/class.module';
import { ClassScheduleModule } from './class_schedule/class_schedule.module';
import databaseConfig from './config/database.config';
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
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>(
          'database',
        ) as TypeOrmModuleOptions,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
