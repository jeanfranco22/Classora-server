import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ResponseClassSchedule } from 'src/class_schedule/dtos/ResponseClassSchedule.dto';

export class ResponseClass {
  @IsNotEmpty({ message: 'El id de una clase no puede estar vacío' })
  @IsUUID()
  id: string;

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

  @IsNotEmpty({ message: 'La clase tiene que estar activa o no' })
  @IsBoolean({ message: 'La clase esta activa o no debe ser un booleano' })
  isActive: boolean;

  class_schedule: ResponseClassSchedule;
}
