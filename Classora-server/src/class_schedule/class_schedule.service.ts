/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ClassScheduleRepository } from './class_schedule.repository';
import { CreateClassSchedule } from './dtos/CreateClassSchedule.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { DataSource } from 'typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import { User } from 'src/users/users.entity';
import { coachRepository } from 'src/coach/coach.repository';
import { ClassRepository } from 'src/class/class.repository';
import { ResponseClassSchedule } from './dtos/ResponseClassSchedule.dto';
import { Role } from 'src/common/roles.enum';

type CoachAssignment = Pick<User, 'id' | 'name' | 'email'>;

@Injectable({})
export class ClassScheduleService {
  constructor(
    private readonly classScheduleRepository: ClassScheduleRepository,
    private readonly classRepository: ClassRepository,
    private readonly coachRepository: coachRepository,
    private dataSource: DataSource,
  ) {}

  classes_history() {
    return this.classScheduleRepository.classes_history();
  }

  async class_appointment(
    clase_app: CreateClassSchedule,
    id_class: string,
    user: JwtPayload,
  ) {
    console.log(user);
    // Buscamos la clase a la cual queremos hacerle una cita
    const find_class = await this.classRepository.find_class_by_id(id_class);

    // Convertimos la duración a número (por si viene como string "60")
    const duration = parseInt(find_class.duration, 10);

    // Validamos que la fecha y la hora de clase que se va a agendar sea válida
    this.time_valid(clase_app.date, clase_app.time, duration);

    // Asignamos coach (llamada local)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const coach_id = user.role === Role.Coach ? (user as any).id : undefined;
    const assigned_coach = await this.coach_assign(
      clase_app.date,
      clase_app.time,
      coach_id,
    );

    // Guardamos usando el REPOSITORIO
    const new_schedule: Partial<Class_schedule> = {
      ...clase_app,
      class: find_class,
      coach: { id: assigned_coach.id } as User,
    };

    const saved_schedule =
      await this.classScheduleRepository.save_new_schedule(new_schedule);

    // Retornamos el objeto Response limpio
    return this.mapToResponse(saved_schedule);
  }

  // Método privado para limpiar la respuesta y no repetir código
  private mapToResponse(
    schedule: Partial<Class_schedule> & {
      class: { id: string; name: string };
      coach: { id: string; name: string; email: string };
    },
  ): ResponseClassSchedule {
    return {
      id: schedule.id!,
      date: schedule.date
        ? new Date(schedule.date).toISOString().split('T')[0]
        : null,
      time: schedule.time!,
      token: schedule.token!,
      isActive: schedule.isActive!,
      class: { id: schedule.class.id, name: schedule.class.name },
      coach: {
        id: schedule.coach.id,
        name: schedule.coach.name,
        email: schedule.coach.email,
      },
    };
  }

  async class_appmnt_cancel(id: string) {
    // Buscamos que la clase exista
    const class_schedule =
      await this.classScheduleRepository.find_class_schedule_by_id(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Desactivamos la clase
      await queryRunner.manager.update(Class_schedule, id, {
        isActive: false,
        coach: undefined, // Liberamos al coach para esa fecha/hora
      });

      // Buscamos la reservaciones confirmadas para esta clase
      const reservations = await queryRunner.manager.find(Reservation, {
        where: { class_schedule: { id }, status: 'Confirmed' },
        relations: ['users'],
      });

      // Devolvemos los tokens e inhabilitamos mas reservas
      if (reservations.length > 0) {
        for (const res of reservations) {
          // Devolvemos los tokens a los usuarios
          await queryRunner.manager.increment(
            User,
            { id: res.users.id },
            'tokenBalance',
            class_schedule.token, // Usamos el costo de los token de la clase para devolverle al usuario
          );

          // Cambiamos el estado de la reserva a 'Cancelled'
          await queryRunner.manager.update(Reservation, res.id, {
            status: 'Cancelled',
          });
        }
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Clase cancelada y ${reservations.length} reembolso/s procesado/s.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  time_valid(date_appt: Date, time_appt: string, duration_mins: number) {
    // Normalizamos a la fecha para comparar dias (quitamos hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // date_appt ya es un objeto Date, pero por seguridad nos aseguramos
    const scheduleDate = new Date(date_appt);
    const utcDate = new Date(
      scheduleDate.getUTCFullYear(),
      scheduleDate.getUTCMonth(),
      scheduleDate.getUTCDate(),
    );

    // Validamos la fecha futura
    if (utcDate <= today) {
      throw new BadRequestException(
        'La fecha debe ser posterior al día actual',
      );
    }

    // Parsear hora de inicio -- Lo unico no toma 3 digitos (mas de 1 hora 39 minutos)
    const time_match = time_appt.match(/^(\d{1,2}):(\d{2})$/);

    if (!time_match) {
      throw new BadRequestException('Formato de hora inválido. Use HH:mm');
    }

    const hours = parseInt(time_match[1], 10);
    const minutes = parseInt(time_match[2], 10);
    const start_total_minutes = hours * 60 + minutes;

    // Validamos que la cita no empiece antes de las 10:00 (600 min)
    if (start_total_minutes < 600) {
      throw new BadRequestException(
        'La clase solo puede agendarse a partir de las 10:00 a.m en adelante',
      );
    }

    // Validamos que termine a las 18:00 (1080 min) como máximo
    const end_total_minutes = start_total_minutes + duration_mins;
    const limit_minutes = 1080;

    if (end_total_minutes > limit_minutes) {
      const extraMinutes = end_total_minutes - limit_minutes;
      throw new BadRequestException(
        `La clase excede el horario de cierre por ${extraMinutes} minuto(s). Debe terminar máximo a las 18:00 hs.`,
      );
    }
  }

  async coach_assign(
    date: Date,
    time: string,
    id?: string,
    exclude_id?: string,
  ): Promise<CoachAssignment> {
    // Si el que creo la clase es Coach
    if (id) {
      const coach = await this.coachRepository.getCoachById(id);

      const is_occupied = await this.dataSource
        .getRepository(Class_schedule)
        .findOne({
          where: {
            coach: { id: coach.id },
            date,
            time,
            isActive: true,
          },
        });

      if (is_occupied) {
        throw new BadRequestException(
          'Ya tenes una clase asignada en esa fecha/horario',
        );
      }

      return coach;
    }

    // Si es admin
    const coaches = await this.coachRepository.getAllCoaches(1, 10);

    for (const candidate of coaches) {
      // Si el candidato es el que estamos inhabilitando, lo saltamos
      if (exclude_id && candidate.id === exclude_id) continue;

      const is_occupied = await this.dataSource
        .getRepository(Class_schedule)
        .findOne({
          where: {
            coach: { id: candidate.id },
            date,
            time,
            isActive: true,
          },
        });

      if (!is_occupied) return candidate;
    }

    throw new BadRequestException(
      'No hay coaches disponibles para este horario',
    );
  }
}
