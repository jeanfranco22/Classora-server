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
import { UpdateCoachDto } from './dto/updateCoach.dto';
import { GetByEmailDto } from 'src/users/dto/getByEmail.dto';

@Injectable()
export class coachRepository {
  constructor(
    @InjectRepository(User) private coachesRepository: Repository<User>,
  ) {}

  async getAllCoaches(page: number, limit: number) {
    const skip: number = (page - 1) * limit;
    const allCoaches = await this.coachesRepository.find({
      skip: skip,
      take: limit,
      where: { role: Role.Coach },
    });

    return allCoaches.map(
      ({ password, ...coachNoPassword }) => coachNoPassword,
    );
  }

  async getCoachById(id: string) {
    const coach = await this.coachesRepository.findOne({
      where: { id: id, role: Role.Coach },
      relations: [
        'memberships',
        'transactions',
        'reservations',
        'classSchedules',
      ],
    });

    if (!coach)
      throw new NotFoundException(`No se encontró el entrenador con id ${id}`);

    const { password, ...coachNoPassword } = coach;
    return coachNoPassword;
  }

  async updateCoach(id: string, newCoachData: UpdateCoachDto) {
    const coach = await this.coachesRepository.findOneBy({ id });
    if (!coach || coach.isActive !== true)
      throw new NotFoundException('No se encontró el entrenador');
    const mergedcoach = this.coachesRepository.merge(coach, newCoachData);
    const savedCoach = await this.coachesRepository.save(mergedcoach);
    return savedCoach;
  }

  async promoteCoach(id: string) {
    const coach = await this.coachesRepository.findOneBy({ id });

    if (!coach) {
      throw new NotFoundException('No se encontró el usuario solicitado');
    }

    //  Validación nueva
    if (coach.role === Role.Coach) {
      throw new BadRequestException('El usuario ya es coach');
    }

    coach.role = Role.Coach;

    await this.coachesRepository.save(coach);

    return coach;
  }

  async demoteCoach(id: string) {
    const coach = await this.coachesRepository.findOneBy({ id });
    if (!coach)
      throw new NotFoundException('No se encontró el usuario solicitado');
    coach.role = Role.User;
    await this.coachesRepository.save(coach);
    return coach;
  }

  async getNameAndImg() {
    const AllCoaches = await this.coachesRepository.find({
      where: { role: Role.Coach, isActive: true },
      select: { name: true, profileImg: true },
    });
    return AllCoaches;
  }

  async inactiveCoach(id: string) {
    //Hace falta hacer borrado logico
    const coach = await this.coachesRepository.findOneBy({ id });
    if (!coach || coach.isActive !== true)
      throw new NotFoundException('No se encontró al usuario');
    coach.isActive = false;
    await this.coachesRepository.save(coach);
    return coach;
  }

  async getByEmail(searchEmail: GetByEmailDto) {
    const coach = await this.coachesRepository.findOne({
      where: { email: searchEmail.email },
    });
    if (!coach)
      throw new NotFoundException(
        `El entrenador con el email ${searchEmail} no se encuentra en la base de datos`,
      );
    return coach;
  }
}
