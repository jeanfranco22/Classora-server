import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { TokenPackage } from '../token-package/token-package.entity';

// Tipo de transacción: qué originó el movimiento de dinero o tokens
export enum TransactionType {
  MEMBERSHIP_PURCHASE = 'membership_purchase', // Compra de membresía con dinero real
  TOKEN_PURCHASE = 'token_purchase', // Compra de tokens con dinero real (via Stripe)
  TOKEN_SPEND = 'token_spend', // Uso de tokens para reservar clase especial
  TOKEN_REFUND = 'token_refund', // Devolución de tokens al usuario
}

// Estado del pago en Stripe (solo aplica a transacciones con dinero real)
export enum TransactionStatus {
  PENDING = 'pending', // Pago iniciado, esperando confirmación de Stripe
  COMPLETED = 'completed', // Stripe confirmó el pago exitosamente
  FAILED = 'failed', // El pago falló (tarjeta rechazada, etc.)
  REFUNDED = 'refunded', // El pago fue reembolsado
}

// Esta entidad guarda TODOS los movimientos: pagos con dinero y uso de tokens
// Sirve como historial completo y auditoría de cada usuario
@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Qué tipo de operación fue (ver enum arriba)
  @Column({ type: 'enum', enum: TransactionType, nullable: false })
  type: TransactionType;

  // Estado del pago (solo relevante para pagos con dinero real)
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Monto en dinero real (0 si fue solo uso de tokens internos)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  // Cantidad de tokens involucrados (0 si fue solo pago con dinero)
  @Column({ type: 'int', default: 0 })
  tokenAmount: number;

  // ID del PaymentIntent de Stripe (null si fue transacción interna de tokens)
  @Column({ type: 'varchar', nullable: true })
  stripePaymentIntentId: string;

  // Nota descriptiva: "Reserva clase yoga - martes 10am", "Compra membresía Premium"
  @Column({ type: 'text', nullable: true })
  description: string;

  // Fecha y hora exacta en que ocurrió la transacción (se llena automáticamente)
  @CreateDateColumn()
  createdAt: Date;

  // ManyToOne = muchas transacciones → un usuario
  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ManyToOne = muchas transacciones → un paquete de tokens (nullable porque membresías no tienen paquete)
  @ManyToOne(() => TokenPackage, (pkg) => pkg.transactions, { nullable: true })
  @JoinColumn({ name: 'tokenPackageId' })
  tokenPackage: TokenPackage;
}
