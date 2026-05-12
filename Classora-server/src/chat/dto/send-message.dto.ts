// DTO para cuando alguien envía un mensaje (via WebSocket o HTTP)
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-de-la-conversacion' })
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ example: 'Hola, necesito ayuda con mi rutina' })
  @IsString()
  @IsNotEmpty()
  content: string;

  // El senderId lo obtendremos del usuario autenticado, no lo envía el cliente
}
