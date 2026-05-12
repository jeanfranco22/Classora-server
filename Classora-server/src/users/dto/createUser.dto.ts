import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDateString,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(50, { message: 'El nombre debe tener máximo 50 caracteres' })
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @MaxLength(50, {
    message: 'El correo electrónico debe tener máximo 50 caracteres',
  })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La contraseña no cumple con los requisitos',
  })
  @Length(8, 60, {
    message: 'La contraseña debe tener entre 3 y 60 caracteres',
  })
  password: string;

  @IsNotEmpty({ message: 'La confirmación de contraseña no puede estar vacía' })
  @IsString({
    message: 'La confirmación de contraseña debe ser una cadena de texto',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
    message: 'La contraseña no cumple con los requisitos',
  })
  @Length(8, 60, {
    message: 'La contraseña debe tener entre 3 y 60 caracteres',
  })
  confirmPassword: string;

  @IsString({ message: 'El telefono debe ser una cadena de texto' })
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
  profileImg: string;
}
