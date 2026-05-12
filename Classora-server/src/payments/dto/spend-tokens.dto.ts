import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, IsString, Min } from 'class-validator';

export class PurchaseTokensDto {
  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-del-paquete' })
  @IsUUID()
  @IsNotEmpty()
  packageId: string;
}

export class SpendTokensDto {
  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  userId: string;

  // Cuántos tokens quiere gastar
  @ApiProperty({ example: 50, description: 'Cantidad de tokens a gastar' })
  @IsInt()
  @Min(1)
  amount: number;

  // Para qué los gasta (queda en el historial)
  @ApiProperty({ example: 'Reserva clase yoga - martes 10am' })
  @IsString()
  description: string;
}
