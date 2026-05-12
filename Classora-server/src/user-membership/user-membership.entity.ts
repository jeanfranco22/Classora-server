import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Membership } from '../membership/membership.entity';

// Enum para saber en qué estado está la suscripción del usuario
export enum MembershipStatus {
  ACTIVE = 'active', // Membresía vigente
  EXPIRED = 'expired', // Venció la fecha de fin
  CANCELLED = 'cancelled', // El usuario canceló antes de vencer
  PENDING = 'pending', // Pago iniciado pero aún no confirmado por Stripe
}

// Esta entidad guarda LA SUSCRIPCIÓN de un usuario específico
// Ejemplo: "Juan tiene membresía Premium desde el 1 de enero hasta el 31 de enero"
// Es diferente a Membership (que es solo el catálogo/plantilla)
@Entity({ name: 'student_memberships' })
export class UserMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Fecha en que empieza la membresía del usuario
  @Column({ type: 'date', nullable: false })
  startDate: Date;

  // Fecha en que termina la membresía del usuario
  @Column({ type: 'date', nullable: false })
  endDate: Date;

  // Estado actual de la suscripción (ver enum arriba)
  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.PENDING,
  })
  status: MembershipStatus;

  // ID del pago en Stripe para poder verificarlo o reembolsarlo
  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId: string;

  // Precio que pagó el usuario (puede diferir del precio actual del plan si hubo descuento)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  pricePaid: number;

  // Fecha en que se creó este registro
  @CreateDateColumn()
  createdAt: Date;

  // ManyToOne = muchas suscripciones → un usuario
  // El @JoinColumn crea la columna FK "userId" en la tabla user_memberships
  @ManyToOne(() => User, (user: User) => user.memberships, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ManyToOne = muchas suscripciones → un tipo de membresía

  @ManyToOne(
    () => Membership,
    (membership: Membership) => membership.userMemberships,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  // ── MÉTODOS HELPER ────────────────────────────────────────────────────────

  // Verifica si esta membresía está activa Y no ha vencido
  // Útil para validar antes de permitir acciones que requieren membresía
  isActiveAndValid(): boolean {
    const now = new Date();
    return (
      this.status === MembershipStatus.ACTIVE && new Date(this.endDate) > now
    );
  }
}
