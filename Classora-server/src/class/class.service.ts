import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassRepository } from './class.repository';
import { CreateClass } from './dtos/CreateClass.dto';
import { UpdateClass } from './dtos/UpdateClass.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepository: ClassRepository,
    private readonly filesService: FilesService,
  ) {}

  get_classes() {
    return this.classRepository.get_classes();
  }

  get_all_classes() {
    return this.classRepository.get_all_classes();
  }

  create_new_class(clase: CreateClass) {
    return this.classRepository.create_class(clase);
  }

  update_class(id: string, clase: UpdateClass) {
    return this.classRepository.update(id, clase);
  }

  delete_class(id: string) {
    return this.classRepository.deleted_class(id);
  }

  activeClass(id: string) {
    return this.classRepository.activeClass(id);
  }

  // SUBIR IMAGEN DE CLASE (Cloudinary)
  // Flujo: traer clase -> subir nueva -> borrar anterior -> guardar url + publicId
  async uploadClassImage(id: string, file: Express.Multer.File) {
    // 1) Traigo la clase desde DB para tener cloudinaryId actual
    const classEntity = await this.classRepository.getById(id);
    if (!classEntity) throw new NotFoundException('Clase no encontrada');

    // 2) Subo imagen nueva a Cloudinary (carpeta de clases)
    const uploaded = await this.filesService.uploadImage(
      file,
      'powergym/classes',
    );

    // 3) Borro la anterior si existÃ­a
    if (classEntity.cloudinaryId) {
      await this.filesService.deleteImage(classEntity.cloudinaryId);
    }

    // 4) Guardo nueva url + public_id en DB
    return this.classRepository.updateImage(
      id,
      uploaded.secure_url,
      uploaded.public_id,
    );
  }
}
