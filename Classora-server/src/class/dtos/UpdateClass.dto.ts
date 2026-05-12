import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Intensity } from '../class.entity';

export class UpdateClass {
  @IsOptional({ message: 'El nombre de la clase es opcional' })
  @IsString({ message: 'El nombre de la clase debe ser una cadena de texto' })
  @Length(3, 50, {
    message: 'El nombre de la clase debe tener entre 3 y 50 cáracteres',
  })
  name?: string;

  @IsOptional({ message: 'La duración de la clase es opcional' })
  @IsString({ message: 'La duración de la clase debe ser una cadena de texto' })
  @Length(2, 10, {
    message: 'La duración de la clase debe tener entre 2 y 10 cáracteres',
  })
  duration?: string;

  @IsOptional({ message: 'La descripción de la clase es opcional' })
  @IsString({
    message: 'La descripción de la clase debe ser una cadena de texto',
  })
  @Length(0, 200, {
    message: 'La descripción de la clase puede tener hasta 200 cáracteres',
  })
  description?: string;

  @IsOptional({ message: 'La capacidad de la clase es opcional' })
  @IsNumber()
  @IsPositive({
    message: 'La capacidad de la clase debe ser un número positivo',
  })
  capacity?: number;

  @IsOptional({ message: 'La clase tiene que estar activa o no' })
  @IsBoolean({ message: 'La clase esta activa o no debe ser un booleano' })
  isActive?: boolean;

  @IsOptional({
    message: 'La intensidad no puede estar vacía. Debe ser alta, media o baja',
  })
  intensity?: Intensity;

  @IsOptional()
  @IsString({ each: true, message: 'Cada beneficio debe ser texto' })
  benefits?: string[];

  @IsOptional()
  @IsString({ each: true, message: 'Los requisitos deben ser texto' })
  @Length(0, 300)
  requirements?: string;
}
