import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { Message } from './message.entity';
import { Class_schedule } from 'src/class_schedule/class_schedule.entity';

// Estado de la conversación
export enum ConversationStatus {
  ACTIVE = 'active', // Conversación activa
  CLOSED = 'closed', // Cerrada por el coach o el usuario
  ARCHIVED = 'archived', // Archivada después de X días de inactividad
}

// Esta entidad representa una conversación 1-a-1 entre un usuario y un coach
// Es como un "hilo" o "sala" donde se envían mensajes
@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Estado actual de la conversación
  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  // Fecha de creación (se llena automáticamente)
  @CreateDateColumn()
  createdAt: Date;

  // Se actualiza cada vez que llega un mensaje nuevo
  // Útil para ordenar conversaciones por "más recientes" en el panel del coach
  @UpdateDateColumn()
  lastMessageAt: Date;

  // ManyToOne = muchas conversaciones → un usuario (el cliente)
  // nullable: false = siempre debe haber un usuario asignado
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ManyToOne = muchas conversaciones → un coach
  // nullable: false = siempre debe haber un coach asignado
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'coachId' })
  coach: User;

  @ManyToOne(() => Class_schedule, { nullable: true })
  @JoinColumn({ name: 'classScheduleId' })
  class_schedule: Class_schedule;

  // OneToMany = una conversación → muchos mensajes
  // cascade: true = al borrar la conversación, se borran todos sus mensajes
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];
}
