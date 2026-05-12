import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/users.entity';
import { Conversation } from './conversation.entity';

// Tipo de mensaje para saber quién lo envió
export enum MessageType {
  USER = 'user', // Mensaje del usuario (cliente)
  COACH = 'coach', // Mensaje del coach (humano)
  BOT = 'bot', // Mensaje automático del chatbot
  SYSTEM = 'system', // Mensaje del sistema (ej: "Coach asignado", "Conversación cerrada")
}

// Esta entidad guarda cada mensaje individual
// Cada mensaje pertenece a una conversación y tiene un remitente
@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Contenido del mensaje (texto)
  @Column({ type: 'text', nullable: false })
  content: string;

  // Tipo de mensaje (ver enum arriba)
  @Column({ type: 'enum', enum: MessageType, nullable: false })
  type: MessageType;

  // Si el mensaje fue leído por el destinatario
  // Útil para mostrar el ícono de "visto" en el chat
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  // Fecha y hora exacta del mensaje (se llena automáticamente)
  @CreateDateColumn()
  createdAt: Date;

  // ManyToOne = muchos mensajes → un remitente (User)
  // El remitente puede ser el usuario cliente O el coach, según el 'type'
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // ManyToOne = muchos mensajes → una conversación
  // onDelete: CASCADE = si se borra la conversación, se borran sus mensajes
  @ManyToOne(() => Conversation, (conv) => conv.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
