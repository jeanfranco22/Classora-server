// DTO para que el admin cree respuestas automáticas del bot
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateFAQDto {
  @ApiProperty({ example: 'horario,horarios,hora,cuando' })
  @IsString()
  @IsNotEmpty()
  keywords: string;

  @ApiProperty({ example: 'Estamos abiertos de lunes a viernes de 6am a 10pm' })
  @IsString()
  @IsNotEmpty()
  response: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ example: 'Horarios' })
  @IsOptional()
  @IsString()
  category?: string;
}
