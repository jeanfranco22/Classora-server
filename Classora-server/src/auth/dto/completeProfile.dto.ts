import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CompleteProfileDto {
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  phone: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  address: string;

  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La ciudad no puede estar vacía' })
  @MaxLength(50, { message: 'La ciudad debe tener máximo 50 caracteres' })
  city: string;

  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe tener un formato de fecha válido' },
  )
  @IsNotEmpty({ message: 'La fecha de nacimiento no puede estar vacía' })
  Birthdate: Date;

  @IsOptional()
  @IsString({ message: 'La imagen de perfil debe ser una cadena de texto' })
  profileImg?: string;
}
