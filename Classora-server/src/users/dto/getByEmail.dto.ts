import { IsEmail } from 'class-validator';

export class GetByEmailDto {
  @IsEmail({}, { message: 'El texto ingresado no es un email valido' })
  email: string;
}
