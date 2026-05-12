import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Intensity } from '../class.entity';

export class CreateClass {
  @IsNotEmpty({ message: 'El nombre de la clase no puede estar vacío' })
  @IsString({ message: 'El nombre de la clase debe ser una cadena de texto' })
  @Length(3, 50, {
    message: 'El nombre de la clase debe tener entre 3 y 50 cáracteres',
  })
  name: string;

  @IsNotEmpty({ message: 'La duración de la clase no puede estar vacía' })
  @IsString({ message: 'La duración de la clase debe ser una cadena de texto' })
  @Length(2, 10, {
    message: 'La duración de la clase debe tener entre 2 y 10 cáracteres',
  })
  duration: string;

  @IsOptional({ message: 'La descripción de la clase es opcional' })
  @IsString({
    message: 'La descripción de la clase debe ser una cadena de texto',
  })
  @Length(0, 200, {
    message: 'La descripción de la clase puede tener hasta 200 cáracteres',
  })
  description?: string;

  @IsNotEmpty({ message: 'La capacidad de la clase no puede estar vacía' })
  @IsNumber()
  @IsPositive({
    message: 'La capacidad de la clase debe ser un número positivo',
  })
  capacity: number;

  @IsEnum(Intensity)
  intensity: Intensity;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  requirements?: string;
}
