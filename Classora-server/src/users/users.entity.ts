import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/common/roles.enum';
import { UserMembership } from '../user-membership/user-membership.entity';
import { Transaction } from 'src/transactions/transactions.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import { Class_schedule } from 'src/class_schedule/class_schedule.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  // usuario google no tiene contraseña
  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string | null;

  // ─────────────────────────
  // CAMPOS PERFIL (nullable porque google no los trae)
  // ─────────────────────────

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string | null;

  // IMPORTANTISIMO:
  // usamos 'date' (no timestamp) porque es cumpleaños
  // evita problemas de timezone en producción
  @Column({ type: 'date', nullable: true })
  Birthdate: Date | null;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'text', nullable: true })
  profileImg: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  courtesyClass: boolean;

  @Column({ type: 'int', default: 0 })
  tokenBalance: number;

  @OneToMany(() => UserMembership, (um) => um.user)
  memberships: UserMembership[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Reservation, (reservation) => reservation.users)
  reservations: Reservation[];

  @OneToMany(() => Class_schedule, (schedule) => schedule.coach)
  classSchedules: Class_schedule[];
  // ─────────────────────────
  // GOOGLE LOGIN
  // ─────────────────────────

  // quién creó la cuenta
  // local → signup normal
  // google → oauth
  @Column({ type: 'varchar', default: 'local' })
  authProvider: 'local' | 'google';

  // id único que manda google
  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  // si es false → lo vamos a obligar a completar perfil
  @Column({ type: 'boolean', default: false })
  isProfileComplete: boolean;

  // cloudinary

  @Column({ type: 'text', nullable: true })
  cloudinaryId: string | null;
}
