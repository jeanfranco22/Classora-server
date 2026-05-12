import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Transaction } from '../transactions/transactions.entity';
import { UserMembership } from '../user-membership/user-membership.entity';
import { User } from '../users/users.entity';
import { MembershipModule } from '../membership/membership.module';
import { TokenPackageModule } from '../token-package/token-package.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    // Registra las entidades que este módulo necesita manipular directamente
    TypeOrmModule.forFeature([Transaction, UserMembership, User]),

    // Importamos estos módulos para poder usar sus servicios
    // MembershipModule exporta MembershipService → lo usamos para validar que el plan existe
    // TokenPackageModule exporta TokenPackageService → lo usamos para saber el precio del paquete
    MembershipModule,
    TokenPackageModule,
    NotificationsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
