/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/roles.enum';
import { UpdateUserDto } from './dto/updateUser.dto';
import { GetByEmailDto } from './dto/getByEmail.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { CreateUserGoogleDto } from 'src/users/dto/createUser-google.dto';
import { CompleteProfileDto } from 'src/auth/dto/completeProfile.dto';

@Injectable()
export class usersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(page: number, limit: number) {
    const skip: number = (page - 1) * limit;
    const allUsers = await this.usersRepository.find({
      skip: skip,
      take: limit,
      where: { role: Role.User },
      relations: ['memberships'],
    });

    return allUsers.map(({ password, ...userNoPassword }) => userNoPassword);
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id, role: Role.User },
      relations: [
        'memberships',
        'transactions',
        'reservations',
        'classSchedules',
      ],
    });

    if (!user)
      throw new NotFoundException(`No se encontró el usuario con id ${id}`);

    const { password, ...userNoPassword } = user;
    return userNoPassword;
  }

  async updateUser(id: string, newUserData: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user || user.isActive !== true)
      throw new NotFoundException('No se encontró el usuario');
    const mergedUser = this.usersRepository.merge(user, newUserData);
    const savedUser = await this.usersRepository.save(mergedUser);
    return savedUser;
  }

  async promoteUserToAdmin(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('El usuario no fue encontrado');
    user.role = Role.Admin;
    await this.usersRepository.save(user);
    return 'El usuario ahora es un administrador';
  }

  async inactiveUser(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });

    if (!user || user.isActive !== true)
      throw new NotFoundException('No se encontró al usuario');

    if (user.reservations && user.reservations.length > 0) {
      for (const reservation of user.reservations) {
        if (reservation.status === 'Confirmed') {
          reservation.status = 'Cancelled';
        }
      }
    }

    user.isActive = false;

    await this.usersRepository.save(user);
    return user;
  }

  async getByEmail(searchEmail: GetByEmailDto) {
    const email = (searchEmail.email || '').trim().toLowerCase();

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user)
      throw new NotFoundException(
        `El usuario con el email ${email} no se encuentra en la base de datos`,
      );

    return user;
  }

  async createUser(dto: CreateUserDto) {
    const email = (dto.email || '').trim().toLowerCase();

    const exists = await this.usersRepository.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('El email ya está registrado');
    }

    const user = this.usersRepository.create({
      ...dto,
      email,
      isProfileComplete: true,
    });

    return this.usersRepository.save(user);
  }

  //busco usuario activos por lo que charlamos de la duracion del token .. si esta en false no puede hacer nada
  async findIsActiveById(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'isActive'],
    });

    return !!user?.isActive;
  }

  // google
  async findOrCreateByGoogle(dto: CreateUserGoogleDto) {
    const email = (dto.email || '').trim().toLowerCase();

    // 1) busco por email
    let user = await this.usersRepository.findOne({ where: { email } });

    // 2) si existe, linkeo googleId si hace falta
    if (user) {
      // si ya tenía googleId y es distinto → conflicto (otro google)
      if (user.googleId && user.googleId !== dto.googleId) {
        throw new ConflictException(
          'Este email ya está asociado a otra cuenta de Google',
        );
      }

      // si no tenía googleId, se lo guardo
      if (!user.googleId) {
        user.googleId = dto.googleId;
        user.authProvider = 'google';
      }

      // IMPORTANTE:
      // solo guardo la foto de google si el usuario NO tiene imagen previa
      // y además NO tiene imagen subida a cloudinary
      if (!user.profileImg && !user.cloudinaryId && dto.profileImg) {
        user.profileImg = dto.profileImg;
      }

      user = await this.usersRepository.save(user);

      return { user, isNew: false };
    }

    // 3) si no existe, creo usuario Google con perfil incompleto
    const newUser = this.usersRepository.create({
      name: dto.name,
      email,
      googleId: dto.googleId,

      authProvider: 'google',

      // si google manda imagen, la guardo
      profileImg: dto.profileImg ?? null,

      password: null,
      isProfileComplete: false,
    });

    const savedUser = await this.usersRepository.save(newUser);
    return { user: savedUser, isNew: true };
  }

  async completeGoogleProfile(userId: string, data: CompleteProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.authProvider !== 'google')
      throw new BadRequestException('Este usuario no es de Google');

    if (user.isProfileComplete)
      throw new BadRequestException('El perfil ya está completo');

    user.phone = data.phone?.toString();
    user.address = data.address;
    user.city = data.city;
    user.Birthdate = data.Birthdate;
    user.profileImg = data.profileImg ?? user.profileImg;

    user.isProfileComplete = true;

    await this.usersRepository.save(user);

    return { message: 'Perfil completado correctamente' };
  }

  async getUserEntityById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateUserImage(
    id: string,
    data: { profileImg: string; cloudinaryId: string },
  ) {
    const user = await this.getUserEntityById(id);
    user.profileImg = data.profileImg;
    user.cloudinaryId = data.cloudinaryId;
    return this.usersRepository.save(user);
  }

  async activateUser(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException('No se encontró al usuario');

    if (user.isActive === true)
      throw new BadRequestException('El usuario ya está activo');

    user.isActive = true;

    await this.usersRepository.save(user);

    return user;
  }
}
