import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatbotService } from './chatbot.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatbotFAQ } from './entities/chatbot-faq.entity';
import { User } from '../users/users.entity';
import { Class } from '../class/class.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    // Registramos todas las entidades que usa este módulo
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      ChatbotFAQ,
      User, // Necesitamos User para verificar accesos y relaciones
      Class, // Necesitamos Class para sugerir clases al usuario
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatbotService,
    ChatGateway, // El gateway es un provider especial
  ],
  exports: [ChatService, ChatbotService],
})
export class ChatModule {}
