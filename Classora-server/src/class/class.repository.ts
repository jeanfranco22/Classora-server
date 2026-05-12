import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { Repository } from 'typeorm';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';

@Injectable({})
export class ClassRepository {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async find_class_by_id(id: string) {
    const find_class = await this.classRepository.findOne({
      where: { id },
      relations: ['class_schedule'],
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        isActive: true,
        imgUrl: true,
        class_schedule: true,
        intensity: true,
      },
    });

    if (!find_class) {
      throw new NotFoundException(
        `La clase ${id} no fue encontrada o esta inactiva`,
      );
    }

    if (find_class.isActive === false) {
      throw new NotFoundException(
        `La clase con id ${id} que intenta buscar esta inactiva`,
      );
    }

    return find_class;
  }

  get_all_classes() {
    return this.classRepository.find({
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        isActive: true,
        imgUrl: true,
        intensity: true,
        benefits: true,
        requirements: true,
      },
      order: { isActive: 'DESC', name: 'ASC' },
    });
  }

  get_classes() {
    return this.classRepository.find({
      relations: ['class_schedule'],
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        isActive: true,
        imgUrl: true, // 👈 agregado para que el front vea la imagen
        class_schedule: true,
        intensity: true,
        benefits: true,
        requirements: true,
      },
    });
  }

  async create_class(clase: CreateClass) {
    // Guardamos la clase e igualamos el espacio de la clase con el espacio disponible
    await this.classRepository.save({
      ...clase,
    });

    return {
      success: true,
      message: 'Clase creada correctamente',
    };
  }

  async update(id: string, clase: UpdateClass) {
    // Buscamos la clase
    const find_clase = await this.find_class_by_id(id);

    // Mezclamos la informacion que tenemos del usuario no modificada con la que si esta modificada
    const update = this.classRepository.merge(find_clase, clase);

    // Guardamos la clase modificada
    const class_updated = await this.classRepository.save(update);

    return {
      success: true,
      message: 'Clase actualizada correctamente',
      class_updated,
    };
  }

  async deleted_class(id: string) {
    // Buscamos la clase
    await this.find_class_by_id(id);

    // No borramos la clase ya que preservamos informacion que puede ser valiosa en un futuro
    await this.classRepository.update({ id }, { isActive: false });

    return {
      success: true,
      message: 'Clase borrada correctamente',
    };
  }

  async activeClass(id: string) {
    const findClass = await this.classRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        duration: true,
        description: true,
        capacity: true,
        isActive: true,
      },
    });
    if (!findClass)
      throw new NotFoundException(
        'La clase que está buscando no pudo ser encontrada',
      );
    if (findClass.isActive === true)
      throw new BadRequestException('La clase ya está activa');

    findClass.isActive = true;
    const savedClass = await this.classRepository.save(findClass);

    return savedClass;
  }

  // =========================
  // METODOS PARA IMAGEN DE CLASE
  // =========================

  async getById(id: string) {
    const clase = await this.classRepository.findOneBy({ id });

    if (!clase) {
      throw new NotFoundException(`La clase ${id} no fue encontrada`);
    }

    return clase;
  }

  async updateImage(id: string, imgUrl: string, cloudinaryId: string) {
    // Buscamos la clase
    const clase = await this.getById(id);

    // Actualizamos los datos de la imagen
    clase.imgUrl = imgUrl;
    clase.cloudinaryId = cloudinaryId;

    // Guardamos la clase modificada
    await this.classRepository.save(clase);

    return {
      success: true,
      message: 'Imagen de la clase actualizada correctamente',
      imgUrl: clase.imgUrl,
    };
  }
}
