import { BadRequestException, Injectable } from '@nestjs/common';
import { coachRepository } from './coach.repository';
import { UpdateCoachDto } from './dto/updateCoach.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DataSource } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Class_schedule } from 'src/class_schedule/class_schedule.entity';
import { ClassScheduleService } from 'src/class_schedule/class_schedule.service';

@Injectable()
export class CoachService {
  constructor(
    private readonly coachRepository: coachRepository,
    private readonly classScheduleService: ClassScheduleService,
    private readonly notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  getAllCoaches(page: number, limit: number) {
    return this.coachRepository.getAllCoaches(page, limit);
  }

  getCoachById(id: string) {
    return this.coachRepository.getCoachById(id);
  }

  async updateCoach(id: string, newCoachData: UpdateCoachDto) {
    if (newCoachData.password) {
      if (newCoachData.password !== newCoachData.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const hashedPassword = await bcrypt.hash(newCoachData.password, 10);
      newCoachData.password = hashedPassword;
    }

    delete newCoachData.confirmPassword;

    const coach = await this.coachRepository.updateCoach(id, newCoachData);
    await this.notificationsService.sendUpdateEmail(coach.name, coach.email);

    return 'El perfil se ha actualizado exitosamente';
  }

  async promoteCoach(id: string) {
    const coach = await this.coachRepository.promoteCoach(id);
    try {
      await this.notificationsService.promoteCoachEmail(
        coach.name,
        coach.email,
      );
    } catch (error) {
      console.error(
        'Error enviando email de promoción:',
        error instanceof Error ? error.message : error,
      );
    }
    return 'El usuario ahora hace parte de los entrenadores del gimnasio';
  }

  async demoteCoach(id: string) {
    return this.coachRepository.demoteCoach(id);
  }

  async inactiveCoach(id: string) {
    const coach = await this.coachRepository.inactiveCoach(id);
    await this.disableCoach(id);
    await this.notificationsService.inactiveUserEmail(coach.name, coach.email);
    return 'Su cuenta ha sido desactivada exitosamente';
  }

  async disableCoach(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Inhabilitamos al coach
      await queryRunner.manager.update(User, id, { isActive: false });

      // Buscamos clases futuras activas que tenían a este coach
      // Nota: Necesitamos importar Class_schedule
      const futureClasses = await queryRunner.manager.find(Class_schedule, {
        where: {
          coach: { id: id },
          isActive: true,
          // Opcional: date: MoreThan(new Date()) para solo futuras
        },
      });

      // Reasignar cada clase a un nuevo coach
      for (const classSchedule of futureClasses) {
        // Usamos la lógica de asignación que ya tienes (puedes moverla a un Service común)
        const newCoach = await this.classScheduleService.coach_assign(
          classSchedule.date,
          classSchedule.time,
          undefined,
          id, // Excluimos al coach que estamos inhabilitando
        );

        if (newCoach) {
          await queryRunner.manager.update(Class_schedule, classSchedule.id, {
            coach: newCoach,
          });
        } else {
          // ¿Qué pasa si no hay coaches disponibles?
          // Podemos cancelar la clase o dejarla sin coach y enviar una alerta
          throw new BadRequestException(
            `No hay reemplazo para la clase ${classSchedule.id}`,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getNameAndImg() {
    return this.coachRepository.getNameAndImg();
  }

  getByEmail(email: GetByEmailDto) {
    return this.coachRepository.getByEmail(email);
  }
}
