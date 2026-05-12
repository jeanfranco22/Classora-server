import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // para que exista file.buffer
      limits: { fileSize: 1024 * 1024 }, // 1MB
      fileFilter: (req, file, cb) => {
        const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
        if (!ok) return cb(new BadRequestException('Formato inválido'), false);
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    // Paso 5 (extra): valido que exista y que tenga buffer (por si mandan mal el form-data)
    if (!file || !file.buffer) {
      throw new BadRequestException('Archivo inválido (field "file")');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: string | undefined = req.user?.id;
    if (!userId) {
      throw new BadRequestException('No se pudo leer user del token');
    }

    // Traigo user desde DB (para tener cloudinaryId actual)
    const userEntity = await this.usersService.getUserEntityById(userId);

    // Subo imagen nueva
    const uploaded = await this.filesService.uploadImage(
      file,
      'powergym/users',
    );

    // Borro anterior si existía
    if (userEntity.cloudinaryId) {
      await this.filesService.deleteImage(userEntity.cloudinaryId);
    }

    // Guardo nueva en DB
    await this.usersService.updateUserImage(userId, {
      profileImg: uploaded.secure_url,
      cloudinaryId: uploaded.public_id,
    });

    // Respuesta simple para front
    return { profileImg: uploaded.secure_url };
  }
}
