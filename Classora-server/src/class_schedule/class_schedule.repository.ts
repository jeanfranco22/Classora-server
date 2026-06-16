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

  async classes_history(classId?: string) {
    const schedules = await this.classScheduleRepository.find({
      where: classId ? { class: { id: classId } } : undefined,
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

  async classes_by_coach(coachId: string) {
    const schedules = await this.classScheduleRepository.find({
      where: { coach: { id: coachId } },
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
      order: { date: 'ASC', time: 'ASC' },
    });

    return schedules.map((schedule) => {
      const activeReservations = schedule.reservations.filter(
        (r) => r.status === 'Confirmed',
      ).length;

      return {
        ...schedule,
        spaces_available: schedule.class.capacity - activeReservations,
      };
    });
  }

  async save_new_schedule(
    data: Partial<Class_schedule>,
  ): Promise<Class_schedule> {
    const created = this.classScheduleRepository.create(data);

    return await this.classScheduleRepository.save(created);
  }
}
