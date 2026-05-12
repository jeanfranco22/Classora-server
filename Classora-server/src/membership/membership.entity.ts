import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserMembership } from '../user-membership/user-membership.entity';

// Esta entidad representa los TIPOS de membresía que ofrece el gimnasio
// Ejemplo: "Básico", "Premium", "Elite"
// No es la membresía de un usuario específico, sino la plantilla/catálogo
@Entity({ name: 'memberships' })
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre del plan: "Básico", "Premium", "Elite"
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  name: string;

  // Descripción de qué incluye el plan
  @Column({ type: 'text', nullable: true })
  description: string;

  // Precio mensual en la moneda base (ej: 29.99)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  // Duración en días (30 = mensual, 365 = anual)
  @Column({ type: 'int', default: 30, nullable: false })
  durationDays: number;

  // Si esta membresía da acceso a clases especiales
  @Column({ type: 'boolean', default: false })
  includesSpecialClasses: boolean;

  // Si esta membresía incluye chat con coach
  @Column({ type: 'boolean', default: false })
  includesCoachChat: boolean;

  // Porcentaje de descuento en productos del gimnasio (0 = sin descuento)
  @Column({ type: 'int', default: 0 })
  discountPercentage: number;

  // Si el plan está activo y disponible para contratar
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relación: un tipo de membresía puede tener muchos usuarios suscritos
  // OneToMany = un registro aquí → muchos en UserMembership
  @OneToMany(() => UserMembership, (um) => um.membership, { cascade: true })
  userMemberships: UserMembership[];
}
