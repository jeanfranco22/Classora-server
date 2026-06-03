/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/roles.enum';
import { UpdateTeacherDto } from './dto/updateTeacher.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';

@Injectable()
export class TeacherRepository {
  constructor(
    @InjectRepository(User) private teachersRepository: Repository<User>,
  ) {}

  async getAllTeachers(page: number, limit: number) {
    const skip: number = (page - 1) * limit;
    const allTeachers = await this.teachersRepository.find({
      skip: skip,
      take: limit,
      where: { role: Role.TEACHER },
    });

    return allTeachers.map(
      ({ password, ...teacherNoPassword }) => teacherNoPassword,
    );
  }

  async getTeacherById(id: string) {
    const teacher = await this.teachersRepository.findOne({
      where: { id: id, role: Role.TEACHER },
      relations: [
        'memberships',
        'transactions',
        'reservations',
        'classSchedules',
      ],
    });

    if (!teacher)
      throw new NotFoundException(`No se encontró el profesor con id ${id}`);

    const { password, ...teacherNoPassword } = teacher;
    return teacherNoPassword;
  }

  async updateTeacher(id: string, newTeacherData: UpdateTeacherDto) {
    const teacher = await this.teachersRepository.findOneBy({ id });
    if (!teacher || teacher.isActive !== true)
      throw new NotFoundException('No se encontró el profesor');
    const mergedTeacher = this.teachersRepository.merge(teacher, newTeacherData);
    const savedTeacher = await this.teachersRepository.save(mergedTeacher);
    return savedTeacher;
  }

  async promoteTeacher(id: string) {
    const teacher = await this.teachersRepository.findOneBy({ id });

    if (!teacher) {
      throw new NotFoundException('No se encontró el usuario solicitado');
    }

    if (teacher.role === Role.TEACHER) {
      throw new BadRequestException('El usuario ya es teacher');
    }

    teacher.role = Role.TEACHER;

    await this.teachersRepository.save(teacher);

    return teacher;
  }

  async demoteTeacher(id: string) {
    const teacher = await this.teachersRepository.findOneBy({ id });
    if (!teacher)
      throw new NotFoundException('No se encontró el usuario solicitado');
    teacher.role = Role.STUDENT;
    await this.teachersRepository.save(teacher);
    return teacher;
  }

  async getNameAndImg() {
    const allTeachers = await this.teachersRepository.find({
      where: { role: Role.TEACHER, isActive: true },
      select: { name: true, profileImg: true },
    });
    return allTeachers;
  }

  async inactiveTeacher(id: string) {
    //Hace falta hacer borrado logico
    const teacher = await this.teachersRepository.findOneBy({ id });
    if (!teacher || teacher.isActive !== true)
      throw new NotFoundException('No se encontró al usuario');
    teacher.isActive = false;
    await this.teachersRepository.save(teacher);
    return teacher;
  }

  async getByEmail(searchEmail: GetByEmailDto) {
    const teacher = await this.teachersRepository.findOne({
      where: { email: searchEmail.email },
    });
    if (!teacher)
      throw new NotFoundException(
        `El profesor con el email ${searchEmail} no se encuentra en la base de datos`,
      );
    return teacher;
  }
}
