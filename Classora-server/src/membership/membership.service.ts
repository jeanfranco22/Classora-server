import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

// @Injectable() le dice a NestJS que esta clase puede ser inyectada en otros lugares
// Es el equivalente a "registrar el servicio en el contenedor de dependencias"
@Injectable()
export class MembershipService {
  constructor(
    // @InjectRepository inyecta el repositorio de TypeORM para Membership
    // Repository<Membership> tiene métodos como find(), findOne(), save(), delete()
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  // Crea un nuevo tipo de membresía (solo admin)
  async create(dto: CreateMembershipDto): Promise<Membership> {
    // create() construye el objeto en memoria con los datos del DTO
    // save() lo persiste en la base de datos y devuelve el registro con su id generado
    const membership = this.membershipRepository.create(dto);
    return this.membershipRepository.save(membership);
  }

  // Devuelve todos los tipos de membresía activos (para mostrar al usuario)
  async findAllActive(): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' }, // Los ordena de menor a mayor precio
    });
  }

  // Devuelve TODOS incluyendo inactivos (solo para panel admin)
  async findAll(): Promise<Membership[]> {
    return this.membershipRepository.find({ order: { price: 'ASC' } });
  }

  // Busca una membresía por su ID
  // Lanza NotFoundException si no existe (NestJS convierte esto en un 404 automáticamente)
  async findOne(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
    });
    if (!membership) {
      throw new NotFoundException(`Membresía con id ${id} no encontrada`);
    }
    return membership;
  }

  // Actualiza los datos de un tipo de membresía
  async update(id: string, dto: UpdateMembershipDto): Promise<Membership> {
    // findOne ya lanza 404 si no existe, así no repetimos la validación
    const membership = await this.findOne(id);
    // Object.assign copia las propiedades del DTO sobre el objeto existente
    Object.assign(membership, dto);
    return this.membershipRepository.save(membership);
  }

  // Eliminación lógica: en vez de borrar, marca como inactivo
  // Así se conserva el historial de usuarios que tuvieron ese plan
  async deactivate(id: string): Promise<Membership> {
    const membership = await this.findOne(id);
    membership.isActive = false;
    return this.membershipRepository.save(membership);
  }

  async activateMembership(id: string) {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      select: { id: true, name: true, price: true, isActive: true },
    });
    if (!membership || membership.isActive === true)
      throw new BadRequestException(
        'La membresía ya está activa o no fue encontrada',
      );

    membership.isActive = true;

    const savedMembership = await this.membershipRepository.save(membership);
    return savedMembership;
  }
}
