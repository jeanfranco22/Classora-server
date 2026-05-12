/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatbotService } from './chatbot.service';
import { MessageType } from './entities/message.entity';
import { Role } from 'src/common/roles.enum';

// @WebSocketGateway configura el servidor de WebSockets
// cors: true permite conexiones desde el frontend (ajusta en producción)
// namespace: '/chat' hace que las conexiones sean en ws://localhost:3000/chat
@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // @WebSocketServer da acceso a la instancia del servidor Socket.io
  // Lo usamos para emitir eventos a clientes específicos
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatbotService: ChatbotService,
  ) {}

  private getUserIdFromSocket(client: Socket): string | null {
    return (client.data?.userId as string | undefined) ?? null;
  }

  // Se ejecuta cuando un cliente se conecta al WebSocket
  async handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);

    // El cliente debe enviar su userId en el handshake (query params)
    // Ejemplo en frontend: io('http://localhost:3000/chat', { query: { userId: 'uuid' } })
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.log('Cliente sin userId, desconectando...');
      client.disconnect();
      return;
    }

    // Verificar que el usuario tiene acceso al chat
    const user = await this.chatService['userRepository'].findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log(`Usuario ${userId} no encontrado`);
      client.disconnect();
      return;
    }

    if (user.role === Role.User) {
      const hasAccess = await this.chatService.canUserAccessChat(userId);
      if (!hasAccess) {
        console.log(`Usuario ${userId} sin acceso al chat, desconectando...`);
        client.emit('error', {
          message: 'No tienes una membresía activa con chat incluido',
        });
        client.disconnect();
        return;
      }
    }

    // Guardar el userId en el socket para usarlo después

    client.data.userId = userId;

    // Unir al cliente a sus "rooms" (conversaciones)
    // Así podemos enviar mensajes solo a usuarios de una conversación específica
    const conversations = await this.chatService.getUserConversations(userId);
    conversations.forEach((conv) => {
      void client.join(`conversation:${conv.id}`);
    });

    console.log(
      `Usuario ${userId} unido a ${conversations.length} conversaciones`,
    );
  }

  // Se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // @SubscribeMessage('sendMessage') escucha el evento que el cliente emite
  // Cuando el frontend hace: socket.emit('sendMessage', { conversationId, content })
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = this.getUserIdFromSocket(client);

    if (!userId) {
      client.emit('error', { message: 'Usuario no autenticado' });
      return;
    }

    try {
      // 1. Determinar el tipo de mensaje (USER o COACH)
      const conversation = await this.chatService[
        'conversationRepository'
      ].findOne({
        where: { id: data.conversationId },
        relations: ['user', 'coach'],
      });

      if (!conversation) {
        client.emit('error', { message: 'Conversación no encontrada' });
        return;
      }

      const isCoach = conversation.coach.id === userId;
      const messageType = isCoach ? MessageType.COACH : MessageType.USER;

      // 2. Guardar el mensaje en la base de datos
      const message = await this.chatService.sendMessage(
        data.conversationId,
        userId,
        data.content,
        messageType,
      );

      // 3. Emitir el mensaje a todos los usuarios de la conversación (room)
      this.server.to(`conversation:${data.conversationId}`).emit('newMessage', {
        id: message.id,
        conversationId: data.conversationId,
        content: message.content,
        type: message.type,
        senderId: userId,
        createdAt: message.createdAt,
      });

      // 4. Si el mensaje es del usuario (no del coach), intentar respuesta automática
      if (messageType === MessageType.USER) {
        await this.handleBotResponse(data.conversationId, data.content, userId);
      }

      // Confirmar al remitente que el mensaje se envió
      client.emit('messageSent', { success: true, messageId: message.id });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      client.emit('error', { message: errorMessage });
    }
  }

  private async handleBotResponse(
    conversationId: string,
    userMessage: string,
    userId: string,
  ) {
    // 1. Verificar si el mensaje pide sugerencias de clases
    if (this.chatbotService.shouldSuggestClasses(userMessage)) {
      const user = await this.chatService['userRepository'].findOne({
        where: { id: userId },
      });

      if (!user) {
        console.error(`Usuario ${userId} no encontrado`);
        return;
      }

      const suggestion = await this.chatbotService.suggestClasses(user);
      const botMessage = await this.chatService.createBotMessage(
        conversationId,
        suggestion,
      );

      this.server.to(`conversation:${conversationId}`).emit('newMessage', {
        id: botMessage.id,
        conversationId,
        content: botMessage.content,
        type: MessageType.BOT,
        senderId: null,
        createdAt: botMessage.createdAt,
      });
      return;
    }

    // 2. Buscar respuesta automática en las FAQs
    const faqResponse =
      await this.chatbotService.getAutomaticResponse(userMessage);

    if (faqResponse) {
      const botMessage = await this.chatService.createBotMessage(
        conversationId,
        faqResponse,
      );

      this.server.to(`conversation:${conversationId}`).emit('newMessage', {
        id: botMessage.id,
        conversationId,
        content: botMessage.content,
        type: MessageType.BOT,
        senderId: null,
        createdAt: botMessage.createdAt,
      });
      return;
    }

    // 3. Si no hubo respuesta automática, notificar al coach
    // (esto lo puede manejar el frontend mostrando una notificación push)
    console.log(
      `Mensaje sin respuesta automática en conversación ${conversationId}`,
    );
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);

    if (!userId) {
      client.emit('error', { message: 'Usuario no autenticado' });
      return;
    }

    try {
      await this.chatService.markMessagesAsRead(data.conversationId, userId);

      // Notificar a la otra persona que los mensajes fueron leídos
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('messagesRead', {
          conversationId: data.conversationId,
          readBy: userId,
        });

      client.emit('markedAsRead', { success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      client.emit('error', { message: errorMessage });
    }
  }

  // Útil cuando el admin crea una conversación nueva y el cliente necesita unirse
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    void client.join(`conversation:${data.conversationId}`);
    console.log(
      `Cliente ${client.id} se unió a conversación ${data.conversationId}`,
    );
    client.emit('joinedConversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    // Emitir a todos EXCEPTO al remitente
    client.to(`conversation:${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) return;

    client.to(`conversation:${data.conversationId}`).emit('userStoppedTyping', {
      conversationId: data.conversationId,
      userId,
    });
  }
}
