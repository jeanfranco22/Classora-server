// DTO para cuando el admin crea manualmente una conversación
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-del-coach' })
  @IsUUID()
  @IsNotEmpty()
  coachId: string;
}
