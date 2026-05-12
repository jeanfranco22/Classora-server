import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationStatus,
} from './entities/conversation.entity';
import { Message, MessageType } from './entities/message.entity';
import { User } from '../users/users.entity';
import { Role } from '../common/roles.enum';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── VERIFICAR ACCESO AL CHAT ────────────────────────────────────────────

  // Verifica que el usuario tenga una membresía activa con chat incluido
  async canUserAccessChat(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['memberships', 'memberships.membership'],
    });

    if (!user) return false;

    // Busca si tiene alguna membresía activa que incluya chat
    const hasActiveChat = user.memberships.some(
      (um) =>
        (um.status as string) === 'active' &&
        um.membership.includesCoachChat &&
        new Date(um.endDate) > new Date(), // Aún no venció
    );

    return hasActiveChat;
  }

  // ─── CREAR CONVERSACIÓN ──────────────────────────────────────────────────

  // El admin crea manualmente una conversación asignando un coach al usuario
  async createConversation(dto: CreateConversationDto): Promise<Conversation> {
    // Verificar que el usuario existe y tiene acceso al chat
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = (dto as any).userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const coachId = (dto as any).coachId as string;

    const hasAccess = await this.canUserAccessChat(userId);
    if (!hasAccess) {
      throw new BadRequestException(
        'El usuario no tiene una membresía activa con chat incluido',
      );
    }

    // Verificar que el coach existe y tiene el rol correcto
    const coach = await this.userRepository.findOne({
      where: { id: coachId },
    });
    if (!coach || coach.role !== Role.Coach) {
      throw new BadRequestException('El coach especificado no es válido');
    }

    // Verificar que no exista ya una conversación activa entre estos dos
    const existing = await this.conversationRepository.findOne({
      where: {
        user: { id: userId },
        coach: { id: coachId },
        status: ConversationStatus.ACTIVE,
      },
    });

    if (existing) return existing;

    // Crear la conversación
    const conversation = this.conversationRepository.create({
      user: { id: userId } as User,
      coach: { id: coachId } as User,
      status: ConversationStatus.ACTIVE,
    });

    const saved = await this.conversationRepository.save(conversation);

    // Enviar mensaje automático del sistema
    await this.createSystemMessage(
      saved.id,
      `Coach ${coach.name} ha sido asignado a esta conversación.`,
    );

    return saved;
  }

  async createConversationIfNotExists(
    userId: string,
    coachId: string,
    classScheduleId: string,
  ) {
    const existing = await this.conversationRepository.findOne({
      where: {
        user: { id: userId },
        coach: { id: coachId },
        class_schedule: { id: classScheduleId },
      },
    });
    if (existing) return existing;

    const conversation = this.conversationRepository.create({
      user: { id: userId },
      coach: { id: coachId },
      class_schedule: { id: classScheduleId },
      status: ConversationStatus.ACTIVE,
    });

    const saved = await this.conversationRepository.save(conversation);

    await this.createSystemMessage(
      saved.id,
      'Tu chat con el coach ha comenzado',
    );

    return saved;
  }

  // ─── ENVIAR MENSAJE ──────────────────────────────────────────────────────

  // Guarda un mensaje en la base de datos y actualiza la conversación
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType,
  ): Promise<Message> {
    // Verificar que la conversación existe y está activa
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user', 'coach'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    if (conversation.status !== ConversationStatus.ACTIVE) {
      throw new BadRequestException('La conversación está cerrada');
    }

    // Verificar que el remitente es parte de la conversación

    const isUser = conversation.user?.id === senderId;

    const isCoach = conversation.coach?.id === senderId;

    if (
      !isUser &&
      !isCoach &&
      type !== MessageType.BOT &&
      type !== MessageType.SYSTEM
    ) {
      throw new BadRequestException(
        'No tienes permiso para enviar mensajes en esta conversación',
      );
    }

    // Crear el mensaje
    const message = this.messageRepository.create({
      content,
      type,
      sender: { id: senderId } as User,
      conversation: { id: conversationId } as Conversation,
      isRead: false,
    });

    const saved = await this.messageRepository.save(message);

    // Actualizar lastMessageAt de la conversación
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return saved;
  }

  // ─── MENSAJES DEL SISTEMA Y BOT ──────────────────────────────────────────

  async createSystemMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    // Los mensajes del sistema no tienen un sender real, usamos un ID dummy
    // O puedes crear un usuario "System" con un UUID fijo
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const message = this.messageRepository.create({
      content,
      type: MessageType.SYSTEM,

      sender: conversation.user,
      conversation: { id: conversationId } as Conversation,
      isRead: true, // Los mensajes del sistema se marcan como leídos
    });

    return this.messageRepository.save(message);
  }

  async createBotMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const message = this.messageRepository.create({
      content,
      type: MessageType.BOT,

      sender: conversation.user,
      conversation: { id: conversationId } as Conversation,
      isRead: false,
    });

    return this.messageRepository.save(message);
  }

  // ─── LISTAR CONVERSACIONES ───────────────────────────────────────────────

  // Conversaciones del usuario (cliente)
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { user: { id: userId } },
      relations: ['coach', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  // Conversaciones asignadas al coach
  async getCoachConversations(coachId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { coach: { id: coachId } },
      relations: ['user', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  // ─── OBTENER MENSAJES DE UNA CONVERSACIÓN ────────────────────────────────

  async getConversationMessages(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Verificar que el usuario tiene acceso a esta conversación
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user', 'coach'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const hasAccess =
      conversation.user?.id === userId || conversation.coach?.id === userId;

    if (!hasAccess) {
      throw new BadRequestException('No tienes acceso a esta conversación');
    }

    // Traer todos los mensajes ordenados cronológicamente
    const messages = await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    // Marcar como leídos los mensajes que el usuario está viendo
    await this.markMessagesAsRead(conversationId, userId);

    return messages;
  }

  // ─── MARCAR MENSAJES COMO LEÍDOS ─────────────────────────────────────────

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    // Marca como leídos todos los mensajes de la conversación que NO fueron enviados por el usuario
    await this.messageRepository.update(
      {
        conversation: { id: conversationId },
        sender: { id: userId },
        isRead: false,
      },
      { isRead: true },
    );
  }

  // ─── CERRAR CONVERSACIÓN ─────────────────────────────────────────────────

  async closeConversation(conversationId: string): Promise<Conversation> {
    await this.conversationRepository.update(conversationId, {
      status: ConversationStatus.CLOSED,
    });

    await this.createSystemMessage(
      conversationId,
      'La conversación ha sido cerrada.',
    );

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    return conversation;
  }
}
