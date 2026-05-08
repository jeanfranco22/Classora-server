import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../transactions/transactions.entity';
import {
  UserMembership,
  MembershipStatus,
} from '../user-membership/user-membership.entity';
import { User } from '../users/users.entity';
import { MembershipService } from '../membership/membership.service';
import { TokenPackageService } from '../token-package/token-package.service';
@Injectable()
export class PaymentsService {
  // La instancia de Stripe que usamos para hacer llamadas a la API
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private membershipService: MembershipService,
    private tokenPackageService: TokenPackageService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2026-01-28.clover' },
    );
  }

  async createMembershipPaymentIntent(
    userId: string,
    membershipId: string,
  ): Promise<{ clientSecret: string; transactionId: string }> {
    // Verificamos que la membresía existe (lanza 404 si no)
    const membership = await this.membershipService.findOne(membershipId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(membership.price) * 100),
      currency: 'usd',
      // metadata guarda info adicional en Stripe para poder identificar el pago después
      metadata: { userId, membershipId, type: 'membership' },
    });

    // Guardamos la transacción en estado PENDING (aún no pagó)
    const transaction = this.transactionRepository.create({
      type: TransactionType.MEMBERSHIP_PURCHASE,
      status: TransactionStatus.PENDING,
      amount: membership.price,
      stripePaymentIntentId: paymentIntent.id,
      description: `Membresía ${membership.name}`,
      user: { id: userId } as User,
    });
    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret || '',
      transactionId: transaction.id,
    };
  }

  async confirmMembershipPayment(stripePaymentIntentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no fue completado en Stripe');
      }

      const { userId, membershipId } = paymentIntent.metadata as {
        userId: string;
        membershipId: string;
      };

      // Buscamos la membresía para saber cuántos días de acceso dar
      const membership = await this.membershipService.findOne(membershipId);

      // Calculamos las fechas de inicio y fin de la suscripción
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + membership.durationDays);

      // Creamos el registro de suscripción del usuario
      const userMembership = manager.create(UserMembership, {
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        stripePaymentIntentId,
        pricePaid: membership.price,
        user: { id: userId } as User,
        membership: { id: membershipId },
      });
      await manager.save(userMembership);

      // Actualizamos la transacción a COMPLETED
      await manager.update(
        Transaction,
        { stripePaymentIntentId },
        { status: TransactionStatus.COMPLETED },
      );
    });
  }

  // Si ya venció, crea una nueva suscripción desde hoy
  async createMembershipRenewalIntent(
    userId: string,
    membershipId: string,
  ): Promise<{ clientSecret: string; transactionId: string }> {
    const membership = await this.membershipService.findOne(membershipId);

    // Crear PaymentIntent en Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(membership.price) * 100),
      currency: 'usd',
      metadata: { userId, membershipId, type: 'membership_renewal' },
    });

    // Guardar transacción pendiente
    const transaction = this.transactionRepository.create({
      type: TransactionType.MEMBERSHIP_PURCHASE,
      status: TransactionStatus.PENDING,
      amount: membership.price,
      stripePaymentIntentId: paymentIntent.id,
      description: `Renovación membresía ${membership.name}`,
      user: { id: userId } as User,
    });
    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret || '',
      transactionId: transaction.id,
    };
  }

  // Confirmar renovación de membresía tras pago exitoso
  async confirmMembershipRenewal(stripePaymentIntentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no fue completado en Stripe');
      }

      const { userId, membershipId } = paymentIntent.metadata as {
        userId: string;
        membershipId: string;
      };
      const membership = await this.membershipService.findOne(membershipId);

      // Buscar si tiene una membresía anterior del mismo tipo
      const existingMembership = await manager.findOne(UserMembership, {
        where: {
          user: { id: userId },
          membership: { id: membershipId },
        },
        order: { endDate: 'DESC' }, // La más reciente
      });

      let startDate: Date;
      let endDate: Date;

      if (
        existingMembership &&
        new Date(existingMembership.endDate) > new Date()
      ) {
        // Si la membresía anterior aún está vigente, extendemos desde su endDate
        startDate = new Date(existingMembership.endDate);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + membership.durationDays);

        // Marcamos la anterior como CANCELLED (la nueva la reemplaza)
        await manager.update(
          UserMembership,
          { id: existingMembership.id },
          { status: MembershipStatus.CANCELLED },
        );
      } else {
        // Si ya venció o no existe, creamos desde hoy
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + membership.durationDays);
      }

      // Crear nueva suscripción activa
      const userMembership = manager.create(UserMembership, {
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        stripePaymentIntentId,
        pricePaid: membership.price,
        user: { id: userId } as User,
        membership: { id: membershipId },
      });
      await manager.save(userMembership);

      // Completar transacción
      await manager.update(
        Transaction,
        { stripePaymentIntentId },
        { status: TransactionStatus.COMPLETED },
      );
    });
  }

  async createTokenPurchaseIntent(
    userId: string,
    packageId: string,
  ): Promise<{ clientSecret: string; transactionId: string }> {
    const pkg = await this.tokenPackageService.findOne(packageId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(pkg.price) * 100),
      currency: 'usd',
      metadata: { userId, packageId, type: 'token_purchase' },
    });

    const transaction = this.transactionRepository.create({
      type: TransactionType.TOKEN_PURCHASE,
      status: TransactionStatus.PENDING,
      amount: pkg.price,
      tokenAmount: pkg.tokenAmount,
      stripePaymentIntentId: paymentIntent.id,
      description: `Compra paquete: ${pkg.name} (${pkg.tokenAmount} tokens)`,
      user: { id: userId } as User,
      tokenPackage: { id: packageId },
    });
    await this.transactionRepository.save(transaction);

    return {
      clientSecret: paymentIntent.client_secret || '',
      transactionId: transaction.id,
    };
  }
  async confirmTokenPurchase(stripePaymentIntentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El pago no fue completado en Stripe');
      }

      const { userId, packageId } = paymentIntent.metadata as {
        userId: string;
        packageId: string;
      };
      const pkg = await this.tokenPackageService.findOne(packageId);

      // increment suma los tokens al balance actual sin necesidad de leer el valor primero
      // Es más seguro porque evita condiciones de carrera si dos peticiones llegan a la vez
      await manager.increment(
        User,
        { id: userId },
        'tokenBalance',
        pkg.tokenAmount,
      );

      await manager.update(
        Transaction,
        { stripePaymentIntentId },
        { status: TransactionStatus.COMPLETED },
      );
    });
  }

  async spendTokens(
    userId: string,
    amount: number,
    description: string,
  ): Promise<{ newBalance: number }> {
    // Verificamos que el usuario existe y obtenemos su información completa
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['memberships', 'memberships.membership'],
    });

    if (!user) throw new BadRequestException('Usuario no encontrado');

    const hasActiveMembership = user.memberships.some((um) =>
      um.isActiveAndValid(),
    );

    if (!hasActiveMembership) {
      throw new BadRequestException(
        `No puedes usar tokens sin una membresía activa. ` +
          `Tienes ${user.tokenBalance} tokens disponibles que podrás usar ` +
          `cuando renueves tu membresía.`,
      );
    }

    if (user.tokenBalance < amount) {
      throw new BadRequestException(
        `Tokens insuficientes. Tienes ${user.tokenBalance}, necesitas ${amount}`,
      );
    }

    await this.dataSource.transaction(async (manager) => {
      // decrement resta tokens del balance
      await manager.decrement(User, { id: userId }, 'tokenBalance', amount);

      // Registramos el gasto en el historial de transacciones
      const transaction = manager.create(Transaction, {
        type: TransactionType.TOKEN_SPEND,
        status: TransactionStatus.COMPLETED, // Los gastos internos siempre son inmediatos
        tokenAmount: amount,
        description,
        user: { id: userId } as User,
      });
      await manager.save(transaction);
    });

    return { newBalance: user.tokenBalance - amount };
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      // relations carga las relaciones indicadas en la misma query (JOIN)
      relations: ['tokenPackage'],
      order: { createdAt: 'DESC' }, // Las más recientes primero
    });
  }

  async getUserMembershipStatus(userId: string): Promise<{
    hasActiveMembership: boolean;
    tokenBalance: number;
    canUseTokens: boolean;
    activeMembership?: {
      name: string;
      endDate: Date;
      includesCoachChat: boolean;
      includesSpecialClasses: boolean;
      discountPercentage: number;
    };
    message: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['memberships', 'memberships.membership'],
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Buscar la membresía activa y válida
    const activeMembership = user.memberships.find((um) =>
      um.isActiveAndValid(),
    );

    const hasActiveMembership = !!activeMembership;
    const tokenBalance = user.tokenBalance;
    const canUseTokens = hasActiveMembership && tokenBalance > 0;

    let message = '';
    if (!hasActiveMembership && tokenBalance > 0) {
      message = `Tienes ${tokenBalance} tokens disponibles. Renueva tu membresía para poder usarlos.`;
    } else if (!hasActiveMembership && tokenBalance === 0) {
      message = 'No tienes membresía activa ni tokens disponibles.';
    } else if (hasActiveMembership && tokenBalance === 0) {
      message =
        'Tu membresía está activa. Compra tokens para reservar clases especiales.';
    } else {
      message = `Membresía activa con ${tokenBalance} tokens disponibles.`;
    }

    return {
      hasActiveMembership,
      tokenBalance,
      canUseTokens,
      activeMembership: activeMembership
        ? {
            name: activeMembership.membership.name,
            endDate: activeMembership.endDate,
            includesCoachChat: activeMembership.membership.includesCoachChat,
            includesSpecialClasses:
              activeMembership.membership.includesSpecialClasses,
            discountPercentage: activeMembership.membership.discountPercentage,
          }
        : undefined,
      message,
    };
  }
  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      // constructEvent verifica que el webhook viene realmente de Stripe
      // STRIPE_WEBHOOK_SECRET lo obtienes en el dashboard de Stripe
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
      );
    } catch {
      throw new BadRequestException('Webhook signature inválida');
    }

    // Procesamos solo los eventos que nos interesan
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;

      // Según el tipo de pago guardado en metadata, llamamos al método correcto
      if (pi.metadata?.type === 'membership') {
        await this.confirmMembershipPayment(pi.id);
      } else if (pi.metadata?.type === 'membership_renewal') {
        await this.confirmMembershipRenewal(pi.id);
      } else if (pi.metadata?.type === 'token_purchase') {
        await this.confirmTokenPurchase(pi.id);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      await this.transactionRepository.update(
        { stripePaymentIntentId: pi.id },
        { status: TransactionStatus.FAILED },
      );
    }
  }
}
