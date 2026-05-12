import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipDto {
  // @ApiProperty documenta el campo en Swagger
  // @IsNotEmpty valida que no venga vacío
  // @IsString valida que sea texto
  @ApiProperty({ example: 'Premium', description: 'Nombre del plan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Acceso completo al gimnasio + clases grupales',
  })
  @IsOptional() // Este campo es opcional, si no viene no falla la validación
  @IsString()
  description?: string;

  @ApiProperty({ example: 29.99, description: 'Precio mensual en USD' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Duración en días (default: 30)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  includesSpecialClasses?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  includesCoachChat?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Porcentaje de descuento (0-100)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage?: number;
}
