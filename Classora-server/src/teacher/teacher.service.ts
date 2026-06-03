import { BadRequestException, Injectable } from '@nestjs/common';
import { TeacherRepository } from './teacher.repository';
import { UpdateTeacherDto } from './dto/updateTeacher.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DataSource } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Class_schedule } from 'src/class_schedule/class_schedule.entity';
import { ClassScheduleService } from 'src/class_schedule/class_schedule.service';

@Injectable()
export class TeacherService {
  constructor(
    private readonly teacherRepository: TeacherRepository,
    private readonly classScheduleService: ClassScheduleService,
    private readonly notificationsService: NotificationsService,
    private dataSource: DataSource,
  ) {}

  getAllTeachers(page: number, limit: number) {
    return this.teacherRepository.getAllTeachers(page, limit);
  }

  getTeacherById(id: string) {
    return this.teacherRepository.getTeacherById(id);
  }

  async updateTeacher(id: string, newTeacherData: UpdateTeacherDto) {
    if (newTeacherData.password) {
      if (newTeacherData.password !== newTeacherData.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const hashedPassword = await bcrypt.hash(newTeacherData.password, 10);
      newTeacherData.password = hashedPassword;
    }

    delete newTeacherData.confirmPassword;

    const teacher = await this.teacherRepository.updateTeacher(
      id,
      newTeacherData,
    );
    await this.notificationsService.sendUpdateEmail(teacher.name, teacher.email);

    return 'El perfil se ha actualizado exitosamente';
  }

  async promoteTeacher(id: string) {
    const teacher = await this.teacherRepository.promoteTeacher(id);
    try {
      await this.notificationsService.promoteTeacherEmail(
        teacher.name,
        teacher.email,
      );
    } catch (error) {
      console.error(
        'Error enviando email de promoción:',
        error instanceof Error ? error.message : error,
      );
    }
    return 'El usuario ahora hace parte del equipo docente de Classora';
  }

  async demoteTeacher(id: string) {
    return this.teacherRepository.demoteTeacher(id);
  }

  async inactiveTeacher(id: string) {
    const teacher = await this.teacherRepository.inactiveTeacher(id);
    await this.disableTeacher(id);
    await this.notificationsService.inactiveUserEmail(
      teacher.name,
      teacher.email,
    );
    return 'Su cuenta ha sido desactivada exitosamente';
  }

  async disableTeacher(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // TODO(Classora): la relación TypeORM todavía se llama "coach".
      // Debe migrarse a "teacher" con una migración de base de datos.
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
          id, // Excluimos al teacher que estamos inhabilitando.
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
    return this.teacherRepository.getNameAndImg();
  }

  getByEmail(email: GetByEmailDto) {
    return this.teacherRepository.getByEmail(email);
  }
}
