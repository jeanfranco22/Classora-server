/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InjectRepository } from '@nestjs/typeorm';
import { Class_schedule } from './class_schedule.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class ClassScheduleRepository {
  constructor(
    @InjectRepository(Class_schedule)
    private readonly classScheduleRepository: Repository<Class_schedule>,
  ) {}

  async find_class_schedule_by_id(id: string) {
    const class_schedule = await this.classScheduleRepository.findOne({
      where: { id },
      relations: ['coach', 'class'],
    });

    if (!class_schedule)
      throw new NotFoundException(
        `No se encontró la clase agendada con id ${id}`,
      );

    if (class_schedule.isActive === false) {
      throw new NotFoundException(
        `La clase agendada con id ${id} que intenta buscar esta inactiva`,
      );
    }

    return class_schedule;
  }

  async classes_history() {
    const schedules = await this.classScheduleRepository.find({
      relations: ['class', 'reservations', 'coach'],
      select: {
        id: true,
        date: true,
        time: true,
        token: true,
        isActive: true,
        class: {
          id: true,
          name: true,
          duration: true,
          capacity: true,
          intensity: true,
        },
        coach: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    const result: any[] = [];

    for (const schedule of schedules) {
      const activeReservations = schedule.reservations.filter(
        (r) => r.status === 'Confirmed',
      ).length;

      result.push({
        ...schedule,
        spaces_available: schedule.class.capacity - activeReservations,
      });
    }
    return result;
  }

  async save_new_schedule(
    data: Partial<Class_schedule>,
  ): Promise<Class_schedule> {
    const created = this.classScheduleRepository.create(data);

    return await this.classScheduleRepository.save(created);
  }
}
