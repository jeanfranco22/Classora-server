import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La contraseña no cumple con los requisitos',
  })
  @Length(8, 60, {
    message: 'La contraseña debe tener entre 8 y 60 caracteres',
  })
  password?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La confirmación de contraseña no puede estar vacía' })
  @IsString({
    message: 'La confirmación de contraseña debe ser una cadena de texto',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La confirmación de contraseña no cumple con los requisitos',
  })
  @Length(8, 60, {
    message: 'La confirmación de contraseña debe tener entre 8 y 60 caracteres',
  })
  confirmPassword?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(5, 30, { message: 'La dirección debe tener entre 5 y 30 caracteres' })
  address?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La ciudad no puede estar vacía' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @Length(3, 20, { message: 'La ciudad debe tener entre 3 y 20 caracteres' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'La imagen de perfil debe ser una cadena de texto' })
  profileImg?: string;
}
