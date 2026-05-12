import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ResponseClassSchedule {
  @IsNotEmpty({ message: 'El id de la cita de una clase no puede estar vacío' })
  @IsUUID()
  id: string;

  @IsNotEmpty({ message: 'La fecha de cita de la clase no puede estar vacía' })
  date: string | null;

  @IsNotEmpty({
    message: 'El horario de la cita de la clase no puede estar vacía',
  })
  time: string;

  @IsNotEmpty({
    message: 'Los tokens de la cita de la clase no puede estar vacíos',
  })
  @IsNumber()
  token: number;

  @IsNotEmpty({ message: 'La clase citada tiene que estar activa o no' })
  isActive: boolean;

  @IsNotEmpty({
    message: 'La clase citada tiene que mostrar el id de la clase',
  })
  class: {
    id: string;
    name: string;
  };

  @IsNotEmpty()
  coach: {
    id: string;
    name: string;
    email: string;
  };
}
