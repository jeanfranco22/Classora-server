import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatbotService } from './chatbot.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/roles.enum';
import type { AuthenticatedRequest } from 'src/auth/interfaces/auth-request.interface';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatbotService: ChatbotService,
  ) {}

  // ─── CONVERSACIONES ──────────────────────────────────────────────────────

  // POST /chat/conversations — Crear conversación (Admin asigna coach)
  @ApiBearerAuth()
  @Post('conversations')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Crear conversación asignando coach a usuario (Admin)',
  })
  createConversation(@Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(dto);
  }

  // GET /chat/conversations/user/:userId — Listar conversaciones del usuario
  @ApiBearerAuth()
  @Get('conversations/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar conversaciones de un usuario' })
  getUserConversations(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  // GET /chat/conversations/coach/:coachId — Listar conversaciones del coach
  @ApiBearerAuth()
  @Get('conversations/coach/:coachId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar conversaciones asignadas a un coach' })
  getCoachConversations(@Param('coachId', ParseUUIDPipe) coachId: string) {
    return this.chatService.getCoachConversations(coachId);
  }

  // GET /chat/conversations/:id/messages — Obtener mensajes de una conversación
  @ApiBearerAuth()
  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los mensajes de una conversación' })
  getMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.chatService.getConversationMessages(conversationId, userId);
  }

  // PATCH /chat/conversations/:id/close — Cerrar conversación
  @ApiBearerAuth()
  @Patch('conversations/:id/close')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar una conversación' })
  closeConversation(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.closeConversation(id);
  }

  // ─── CHATBOT FAQs (Admin) ────────────────────────────────────────────────

  // POST /chat/faqs — Crear respuesta automática
  @ApiBearerAuth()
  @Post('faqs')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear FAQ para el chatbot (Admin)' })
  createFAQ(@Body() dto: CreateFAQDto) {
    return this.chatbotService.createFAQ(dto);
  }

  // GET /chat/faqs — Listar todas las FAQs
  @Get('faqs')
  @ApiOperation({ summary: 'Listar todas las FAQs del chatbot' })
  getAllFAQs() {
    return this.chatbotService.findAllFAQs();
  }

  // PATCH /chat/faqs/:id — Actualizar FAQ
  @ApiBearerAuth()
  @Patch('faqs/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Actualizar FAQ (Admin)' })
  updateFAQ(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFAQDto) {
    return this.chatbotService.updateFAQ(id, dto);
  }

  // DELETE /chat/faqs/:id — Eliminar FAQ
  @ApiBearerAuth()
  @Delete('faqs/:id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar FAQ (Admin)' })
  deleteFAQ(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatbotService.deleteFAQ(id);
  }

  // GET /chat/access/:userId — Verificar si el usuario tiene acceso al chat
  @Get('access/:userId')
  @ApiOperation({ summary: 'Verificar si el usuario puede usar el chat' })
  async checkAccess(@Param('userId', ParseUUIDPipe) userId: string) {
    const hasAccess = await this.chatService.canUserAccessChat(userId);
    return { userId, hasAccess };
  }
}
