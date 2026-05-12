import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClassSchedule {
  @IsNotEmpty({ message: 'La fecha de cita de la clase no puede estar vacía' })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de cita de la clase debe tener formato "date"' })
  date: Date;

  @IsNotEmpty({
    message: 'El horario de la cita de la clase no puede estar vacía',
  })
  time: string;

  @IsNotEmpty({
    message: 'La clase citada tiene que decir cuantos token va a ocupar',
  })
  token: number;

  @IsOptional()
  @IsString()
  id_coach?: string;
}
