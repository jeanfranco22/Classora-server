import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClassScheduleModule } from 'src/class_schedule/class_schedule.module';
import { ClassModule } from 'src/class/class.module';
import { Class } from 'src/class/class.entity';
import { User } from 'src/users/users.entity';
import { ChatModule } from 'src/chat/chat.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User, Class]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => JwtModule),
    ClassScheduleModule,
    ClassModule,
    ChatModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationRepository],
})
export class ReservationModule {}
